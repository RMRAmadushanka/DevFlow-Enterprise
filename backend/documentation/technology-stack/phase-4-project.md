# Phase 4 — Project Management Technologies

Phase 4 implements project lifecycle, membership RBAC, settings, tags, favorites, activity, and transactional outbox publishing.

Primary module: `services/project-service` (port `8084`, DB `devflow_project`), plus `common-library` and gateway routes.

Architecture overview: [../architecture/project-architecture.md](../architecture/project-architecture.md)

---

## Spring Boot 3

### Purpose
Application runtime for project-service: DI, web MVC, Actuator, security, JPA, Kafka, validation, scheduling.

### Why This Technology
Consistent with Phases 1–3; first-class support for resource-server JWT, OpenFeign, Flyway, and scheduled outbox polling.

### Where It Is Used
- `services/project-service`
- Shared starters via parent `pom.xml`

### Code-Level Integration
Controller → Service → Repository; `@EnableFeignClients`; `@EnableScheduling` via `SchedulingConfig`; `@EnableMethodSecurity` for authenticated controllers.

### Request/Data Flow
```
Gateway → Boot controller → authz + domain service → JPA → PostgreSQL
                         ↘ OutboxService (same TX) → OutboxPublisher → Kafka
```

### Configuration
`application.yml`, `application-local.yml`, `application-docker.yml`; profiles `local` / `docker`; `server.port=8084`.

### Testing
`@SpringBootTest` / unit tests with mocked collaborators; unauthorized controller tests.

### Scaling Considerations
Keep project-service independently deployable; scale horizontally behind gateway; outbox poller should remain single-active or use DB locking if multi-instance contention appears.

---

## Java 21

### Purpose
Language level for project-service and shared library code.

### Why This Technology
LTS, records for DTOs/`EventEnvelope`/`PageResponse`, strong Spring Boot 3 support.

### Where It Is Used
All modules under `backend/` compiled with `maven.compiler.release=21`.

### Code-Level Integration
Records for request/response DTOs; enums for status, visibility, roles, event types.

### Request/Data Flow
N/A (language). Domain logic uses Java types from JWT claims → entities → outbox payload maps.

### Configuration
Parent `pom.xml` → `<java.version>21</java.version>`.

### Testing
JUnit 5 on JDK 21 in CI/`mvn verify`.

### Scaling Considerations
Evaluate virtual threads for Feign/org permission fan-out under list load if needed.

---

## Spring Data JPA

### Purpose
Repository abstraction over Hibernate for projects, members, settings, tags, favorites, activity, outbox.

### Why This Technology
Derived queries, `Specification` for filtered list, pagination via `Pageable`, fits per-service PostgreSQL ownership.

### Where It Is Used
`services/project-service/.../repository/*Repository.java`; list filtering in `ProjectService.buildListSpec`.

### Code-Level Integration
Entities extend `BaseEntity`; `@Version` on project/settings; Criteria API subqueries for tag/favorite filters.

### Request/Data Flow
Service → repository / Specification → Hibernate → SQL → entity → mapper DTO.

### Configuration
`spring.datasource.*`, `spring.jpa.hibernate.ddl-auto=validate`, UTC JDBC timezone.

### Testing
Service tests mock repositories; integration path uses Testcontainers PostgreSQL where enabled.

### Scaling Considerations
Keep list predicates indexed (`organization_id`, `status`, membership user_id); avoid N+1 via batch count/tag loads already used in summary mapping.

---

## Hibernate

### Purpose
JPA provider: ORM mapping, dirty checking, optimistic locking, association constraints.

### Why This Technology
Default Spring Boot JPA engine; PostgreSQL dialect; `@Version` for concurrent updates.

### Where It Is Used
All `@Entity` classes under `com.devflow.project.entity`.

### Code-Level Integration
Enums as strings; `project_key` `updatable=false`; JSONB metadata/payload mappings for activity/outbox.

### Request/Data Flow
`@Transactional` service methods → flush on commit → DB constraints surface as conflicts.

### Configuration
`spring.jpa.*`; naming aligned with snake_case Flyway columns.

### Testing
Constraint failures covered via service exceptions (`DuplicateProjectException`, tag uniqueness).

### Scaling Considerations
Prefer explicit fetch/count queries; keep entities inside service boundary (no entity over Feign).

---

## PostgreSQL

### Purpose
System of record for Phase 4 relational data including transactional outbox.

### Why This Technology
ACID for domain+outbox atomicity, unique constraints, JSONB, ops maturity already in Compose stack.

### Where It Is Used
Database `devflow_project` — projects, members, settings, tags, favorites, activity, outbox.

### Code-Level Integration
JDBC URL per profile; Docker init creates logical DB; no FK to user/org DBs.

### Request/Data Flow
Write path commits domain rows + outbox; reads for authz load memberships; org perms via Feign not SQL joins.

### Configuration
`DB_URL=jdbc:postgresql://localhost:5432/devflow_project` (defaults in `application.yml`).

### Testing
Testcontainers PostgreSQL for Flyway/repository verification.

### Scaling Considerations
Per-service DB ownership; read replicas later for list-heavy APIs; never share writers across services.

---

## Flyway

### Purpose
Versioned schema migrations for `devflow_project`.

### Why This Technology
Repeatable SQL; prevents Hibernate auto-DDL drift; matches Phases 1–3 practice.

### Where It Is Used
`services/project-service/src/main/resources/db/migration/` — `V1` foundation, `V2`–`V8` business tables.

### Code-Level Integration
Boot Flyway autoconfig before JPA validate; see [../database/phase-4-project-database.md](../database/phase-4-project-database.md).

### Request/Data Flow
Service start → Flyway migrate → app ready → APIs use current schema.

### Configuration
`spring.flyway.enabled=true`; locations `classpath:db/migration`.

### Testing
Migrations applied in Testcontainers tests.

### Scaling Considerations
Expand-contract for zero-downtime; keep check constraints aligned with Java enums.

---

## Spring Security

### Purpose
HTTP security filter chain, method security, JWT resource server, JSON 401/403.

### Why This Technology
Standard enterprise security model shared across DevFlow services.

### Where It Is Used
`SecurityConfig` in project-service; `@PreAuthorize("isAuthenticated()")` on controllers; `ProjectAuthorizationService` for permission codes.

### Code-Level Integration
Public: health/actuator/swagger; all `/api/**` authenticated; service-level `require*` methods enforce project/org permissions.

### Request/Data Flow
Bearer JWT → resource server filter → SecurityContext → controller → authorization service → domain.

### Configuration
`@EnableMethodSecurity`; session `STATELESS`; CSRF disabled for Bearer APIs (Phase 2 rationale).

### Testing
`ProjectControllerUnauthorizedTest`; authorization unit tests for role matrix / visibility.

### Scaling Considerations
Cache org permission Feign results later (Redis) if create/list authz becomes hot.

---

## JWT

### Purpose
Stateless access tokens carrying `sub` used to resolve application user id.

### Why This Technology
Works across gateway and multiple resource servers without sticky sessions.

### Where It Is Used
Gateway validation; project-service resource server; Feign relay of `Authorization` to user/org services.

### Code-Level Integration
`SecurityContextUtils.currentUserId()` → Keycloak `sub` → `CurrentUserResolver` → application UUID.

### Request/Data Flow
`Authorization: Bearer` → signature/iss/exp → actor resolve → project RBAC.

### Configuration
```
spring.security.oauth2.resourceserver.jwt.issuer-uri
spring.security.oauth2.resourceserver.jwt.jwk-set-uri
```

### Testing
Missing/invalid token → 401; permission mismatch → 403.

### Scaling Considerations
Short TTL + Keycloak refresh; optional audience hardening later.

---

## Keycloak

### Purpose
Sole Identity Provider; issues tokens; owns passwords and SSO.

### Why This Technology
Avoids custom credential stores; aligns with Phase 2; stable `sub` for application identity.

### Where It Is Used
Realm `devflow`; JWT issuer for project-service; platform roles `ADMIN` / `SUPER_ADMIN` bypass project RBAC.

### Code-Level Integration
No Keycloak Admin API in project-service; identity is JWT-only + user-service mapping.

### Request/Data Flow
Login in Keycloak → JWT → Gateway → project-service (no password tables in `devflow_project`).

### Configuration
`KEYCLOAK_ISSUER_URI` / `KEYCLOAK_JWK_SET_URI` (see `.env.example`); realm under `infrastructure/keycloak/`.

### Testing
Mock JWT / security test support; local realm import for manual E2E.

### Scaling Considerations
Externalize HA Keycloak; never put admin client secret in frontend.

---

## Kafka

### Purpose
Async integration fabric for project domain events consumed by future services.

### Why This Technology
Durable pub/sub matching microservice boundaries; topic already reserved in infra scripts.

### Where It Is Used
- Topic `project-events` (`KafkaTopics.PROJECT_EVENTS`)
- Producer: `OutboxPublisher` only
- See [../events/phase-4-events.md](../events/phase-4-events.md)

### Code-Level Integration
`KafkaTemplate<String,String>` sends `EventEnvelope` JSON keyed by project id.

### Request/Data Flow
Domain commit → outbox PENDING → scheduled publish → Kafka → future consumers (at-least-once).

### Configuration
`spring.kafka.bootstrap-servers`; producer string serializers; consumer group id configured for future use.

### Testing
`OutboxServiceTest` / publisher tests with mocked `KafkaTemplate` where present.

### Scaling Considerations
Partition by aggregate id; monitor FAILED outbox rows; consumer groups per downstream service.

---

## Transactional Outbox

### Purpose
Reliably publish domain events without dual-write loss between PostgreSQL and Kafka.

### Why This Technology
Guarantees event intent commits with domain state; retries independent of request thread.

### Where It Is Used
- Table `outbox_events` (Flyway V8)
- `OutboxService.enqueue`, `ProjectEventPublisher`, `OutboxPublisher`

### Code-Level Integration
Enqueue inside `@Transactional` service methods; `@Scheduled` poller publishes PENDING batches.

### Request/Data Flow
```
Service TX: domain write + INSERT outbox PENDING
Scheduler TX: read PENDING → Kafka send → PUBLISHED / retry → FAILED
```

### Configuration
```
devflow.outbox.poll-interval-ms: 2000
devflow.outbox.batch-size: 50
```

### Testing
Unit tests assert enqueue fields/status; publisher failure increments retry_count.

### Scaling Considerations
Use SKIP LOCKED / leader election if multiple project-service replicas compete on outbox; alert on FAILED.

---

## Feign

### Purpose
Synchronous cross-service calls for actor resolution, user existence, and org permissions.

### Why This Technology
Lightweight HTTP client integrated with Spring Cloud; reuses gateway-authenticated Bearer relay.

### Where It Is Used
- `UserClient` → user-service
- `OrganizationClient` → organization-service `.../members/{userId}/permissions`

### Code-Level Integration
`@EnableFeignClients`; `FeignClientConfig` forwards Authorization; URLs from `devflow.clients.*`.

### Request/Data Flow
Create/list/read authz → Feign org permissions → allow/deny; member add → Feign get user by id.

### Configuration
```
devflow.clients.user-service-url
devflow.clients.organization-service-url
```

### Testing
Mockito mocks for clients in `ProjectAuthorizationServiceTest` / member service tests.

### Scaling Considerations
Timeouts/circuit breakers later; cache permission sets to reduce org-service QPS.

---

## Bean Validation

### Purpose
Declarative request validation (`@NotBlank`, `@Size`, `@Pattern`, `@NotNull`).

### Why This Technology
Fail fast at controller boundary; consistent errors via `GlobalExceptionHandler`.

### Where It Is Used
DTOs such as `CreateProjectRequest` (`key` pattern), tag color `#RRGGBB`, member/role requests.

### Code-Level Integration
`@Valid` on controller bodies; key regexp `^[A-Z0-9]{2,10}$`.

### Request/Data Flow
HTTP JSON → `@Valid` → ConstraintViolation → `ApiError` / `VALIDATION_FAILED` → 400.

### Configuration
Hibernate Validator via `spring-boot-starter-validation`.

### Testing
Controller/service tests for invalid key/color payloads.

### Scaling Considerations
Keep validation at edge DTOs; uniqueness remains DB + 409.

---

## Testcontainers

### Purpose
Real PostgreSQL in integration tests for Flyway/constraints.

### Why This Technology
Catches SQL/check/unique issues mocks miss.

### Where It Is Used
Project-service test suite where integration tests are enabled (module POM includes testcontainers deps as configured).

### Code-Level Integration
JUnit extension starts PostgreSQL; Spring datasource overridden for test context.

### Request/Data Flow
Test → Boot + container DB → Flyway → exercise repositories/APIs → assert.

### Configuration
Docker available to CI/agents; test dependencies in module POM.

### Testing
Use for migration + critical API paths; Mockito unit tests for speed.

### Scaling Considerations
Reuse containers where supported; keep IT scope focused.

---

## JUnit 5

### Purpose
Primary test runner for unit and Spring tests.

### Why This Technology
Standard for Spring Boot 3; parameterized tests for RBAC matrices.

### Where It Is Used
`src/test/java` under project-service (service, authorization, outbox, controller unauthorized tests).

### Code-Level Integration
`@Test`, Spring Boot test annotations.

### Request/Data Flow
N/A — drives test execution of service/controller layers.

### Configuration
Surefire/Failsafe via parent Maven POM.

### Testing
`mvn -pl services/project-service -am test`.

### Scaling Considerations
Keep fast unit tests dominant; reserve heavier IT for critical paths.

---

## Mockito

### Purpose
Isolate services from JPA, Kafka, and Feign collaborators.

### Why This Technology
Fast, deterministic unit tests for authz, create/archive flows, outbox enqueue.

### Where It Is Used
`ProjectServiceTest`, `ProjectAuthorizationServiceTest`, `ProjectMemberServiceTest`, `OutboxServiceTest`, etc.

### Code-Level Integration
`@Mock` / `@InjectMocks` or Spring `@MockitoBean`; verify Feign and outbox interactions.

### Request/Data Flow
Test invokes service → mocks return entities → assert DTO/events/exceptions.

### Configuration
`spring-boot-starter-test` (Mockito included).

### Testing
Assert soft-delete emits `PROJECT_DELETED`; assert TEAM visibility behaves as members-only.

### Scaling Considerations
Prefer fakes if authz mock graphs become brittle.

---

## OpenAPI

### Purpose
Interactive API docs and contract visibility for frontend integration.

### Why This Technology
springdoc integrates with Spring Security bearer schemes; accelerates wiring from mock UI to real APIs.

### Where It Is Used
project-service springdoc; controller `@Tag` / `@Operation`; Swagger UI path `/swagger-ui.html`.

### Code-Level Integration
Annotated controllers/DTOs; `OpenApiConfig` as present in module.

### Request/Data Flow
Developer opens Swagger → Authorize with JWT → call `/api/projects/**`.

### Configuration
`springdoc.api-docs` / `swagger-ui` properties in `application.yml`.

### Testing
Smoke that docs endpoint is public; business APIs remain authenticated.

### Scaling Considerations
Keep `documentation/api/project-api-contract.md` as the human contract source of truth.

---

## Docker

### Purpose
Local infrastructure and optional service packaging for Phase 4 runtime dependencies.

### Why This Technology
Reproducible Postgres/Kafka/Redis/Keycloak stack for developers.

### Where It Is Used
`infrastructure/docker/docker-compose.yml`; `services/project-service/Dockerfile`; Kafka topic scripts include `project-events`.

### Code-Level Integration
`application-docker.yml` uses Compose DNS; DB `devflow_project`.

### Request/Data Flow
`docker compose up` → infra healthy → run project-service profile `local`/`docker` → gateway `:8080` → `:8084`.

### Configuration
`backend/.env.example`; Keycloak realm import.

### Testing
Compose for manual E2E; Testcontainers for automated DB tests.

### Scaling Considerations
Production uses managed Postgres/Kafka/Keycloak; Compose remains local/dev.

---

## Maven

### Purpose
Multi-module build, dependency BOM alignment, test/package lifecycle.

### Why This Technology
Standard for Spring Boot multi-module repos; consistent across all DevFlow services.

### Where It Is Used
Root `backend/pom.xml`; module `services/project-service`.

### Code-Level Integration
`mvn clean install` builds common-library then services; Failsafe/Surefire for tests.

### Request/Data Flow
N/A — build tool. CI runs same goals as local verify.

### Configuration
Parent dependency management for Boot/Cloud versions; Java 21 release flag.

### Testing
`mvn -pl services/project-service -am verify`.

### Scaling Considerations
Module-scoped CI jobs; keep common-library versioned with reactor build to avoid drift.
