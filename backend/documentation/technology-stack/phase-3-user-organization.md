# Phase 3 — User & Organization Technologies

Phase 3 implements application users, organizations, teams, memberships, RBAC, and invitations using the foundation from Phases 1–2.

Primary modules: `services/user-service`, `services/organization-service`, `common-library`.

Architecture overview: [../architecture/user-organization-architecture.md](../architecture/user-organization-architecture.md)

---

## Spring Boot 3

### Purpose
Application runtime for user-service and organization-service: DI, web MVC, Actuator, security, data, Kafka, validation.

### Why This Technology
Consistent with Phase 1/2 microservices; mature ecosystem for JPA, Security OAuth2, OpenAPI, and Testcontainers.

### Where It Is Used
- `services/user-service`
- `services/organization-service`
- Shared starters via parent `pom.xml`

### Code-Level Integration
Controller → Service → Repository; Feign clients for cross-service calls; `@EnableMethodSecurity` for org permission checks.

### Request/Data Flow
```
Gateway → Boot controller → service (authz + domain) → JPA repository → PostgreSQL
                         ↘ KafkaTemplate → topics
```

### Configuration
`application.yml`, `application-local.yml`, `application-docker.yml` per service; profiles `local` / `docker`.

### Testing
`@SpringBootTest`, `@WebMvcTest`, slice tests with mocked collaborators.

### Scaling Considerations
Keep services independently deployable; align Boot BOM versions via parent POM; prefer horizontal scale behind the gateway.

---

## Java 21

### Purpose
Language level for all Phase 3 services and shared library code.

### Why This Technology
LTS, records for DTOs/envelopes, strong Spring Boot 3 support, virtual threads available for I/O-heavy paths.

### Where It Is Used
All modules under `backend/` compiled with `maven.compiler.release=21`.

### Code-Level Integration
Records for `ApiResponse`, `PageResponse`, `EventEnvelope`, request/response DTOs; enums for statuses and event types.

### Request/Data Flow
N/A (language). Domain logic uses Java types end-to-end from JWT claims → entities → Kafka payloads.

### Configuration
Parent `pom.xml` → `<java.version>21</java.version>`.

### Testing
JUnit 5 on JDK 21 in CI/`mvn verify`.

### Scaling Considerations
Evaluate virtual threads for Feign/Kafka fan-out if contention appears under load.

---

## Spring Data JPA

### Purpose
Repository abstraction over Hibernate for users, orgs, teams, memberships, RBAC, invitations.

### Why This Technology
Rapid CRUD + derived queries; pagination via `Pageable`; fits multi-service PostgreSQL ownership.

### Where It Is Used
- `services/user-service/.../repository/UserRepository.java`
- `services/organization-service/.../repository/*Repository.java`

### Code-Level Integration
Entities extend or mirror `BaseEntity` (`id`, `createdAt`, `updatedAt`); repositories expose `findByExternalIdentityId`, membership uniqueness checks, invitation `token_hash` lookup.

### Request/Data Flow
Service method → repository method → Hibernate Session → SQL → mapped entity → DTO mapper.

### Configuration
`spring.datasource.*`, `spring.jpa.hibernate.ddl-auto=validate` (Flyway owns schema), dialect PostgreSQL.

### Testing
Repository tests with Testcontainers PostgreSQL; service tests mock repositories with Mockito.

### Scaling Considerations
Keep queries org-scoped and indexed; avoid N+1 on membership+role+permission loads (join fetch / projection as needed).

---

## Hibernate

### Purpose
JPA provider: ORM mapping, dirty checking, flush/commit, association loading.

### Why This Technology
Default Spring Boot JPA engine; mature PostgreSQL dialect and constraint mapping.

### Where It Is Used
All `@Entity` classes in user-service and organization-service.

### Code-Level Integration
`@Table` / column constraints mirror Flyway; enums mapped as strings for status/role fields; `RolePermission` junction without `BaseEntity` timestamps.

### Request/Data Flow
Transaction boundary on service methods → Hibernate flush on commit → DB constraints surface as `ConflictException` / 409 where mapped.

### Configuration
`spring.jpa.*`; naming strategy aligned with snake_case columns.

### Testing
Integration tests verify constraint failures (unique slug, unique membership).

### Scaling Considerations
Tune batch size for bulk member ops later; prefer explicit fetch strategies over lazy surprises across Feign boundaries (entities stay in-service).

---

## PostgreSQL

### Purpose
System of record for Phase 3 relational data.

### Why This Technology
ACID, partial unique indexes (active email), mature ops, JSON-ready if preferences expand later.

### Where It Is Used
- `devflow_user` — `users`
- `devflow_organization` — orgs, teams, memberships, RBAC, invitations

### Code-Level Integration
Logical DBs created by Docker init; services connect via JDBC URL per profile.

### Request/Data Flow
Write path commits domain row (+ outbox future) then publishes Kafka; reads for authz load membership → role → permissions.

### Configuration
`infrastructure/docker/docker-compose.yml`; env-based JDBC URLs in service YAML.

### Testing
Testcontainers PostgreSQL for Flyway + repository verification.

### Scaling Considerations
Per-service DB ownership; read replicas later for listing-heavy org/member APIs; never share writers across services.

---

## Flyway

### Purpose
Versioned schema migrations for user and organization databases.

### Why This Technology
Repeatable, reviewable SQL; prevents Hibernate auto-DDL drift in multi-service setups.

### Where It Is Used
- `services/user-service/src/main/resources/db/migration/` (`V2__create_users.sql`)
- `services/organization-service/src/main/resources/db/migration/` (`V2`–`V6`)

### Code-Level Integration
Boot Flyway autoconfig runs before JPA validate; V4 seeds roles/permissions/role_permissions.

### Request/Data Flow
Service start → Flyway migrate → app ready → APIs use current schema.

### Configuration
`spring.flyway.enabled=true`; locations `classpath:db/migration`.

### Testing
Migrations applied in Testcontainers tests; seed IDs stable for role lookups.

### Scaling Considerations
Expand-contract migrations for zero-downtime; keep seeds idempotent (`IF NOT EXISTS` / fixed UUIDs).

---

## Spring Security

### Purpose
HTTP security filter chain, method security, JWT resource server integration, JSON 401/403.

### Why This Technology
Standard enterprise security model shared across DevFlow services.

### Where It Is Used
`SecurityConfig` in user-service and organization-service; `@PreAuthorize` on controllers; `OrganizationAuthorizationService` for permission codes.

### Code-Level Integration
Public: health/actuator/swagger; all `/api/**` authenticated; org APIs check seeded permission codes after membership load.

### Request/Data Flow
Bearer JWT → JwtAuthenticationFilter → SecurityContext → controller advice / `@PreAuthorize` → service-level permission assert.

### Configuration
`@EnableMethodSecurity`; session `STATELESS`; CSRF disabled for Bearer APIs (Phase 2 rationale).

### Testing
`@WithMockUser` / JWT post-processors; forbidden when membership lacks permission.

### Scaling Considerations
Cache permission sets per `(userId, organizationId)` in Redis if authz becomes hot.

---

## JWT

### Purpose
Stateless access tokens carrying `sub` and claims used for upsert and actor resolution.

### Why This Technology
Works across gateway and multiple resource servers without sticky sessions.

### Where It Is Used
Gateway validation; user-service upsert from claims; organization-service invitation email match; Feign relay of `Authorization`.

### Code-Level Integration
`SecurityContextUtils.currentUserId()` → Keycloak `sub`; claim mapping for email/name; realm roles via `JwtRoleConverter`.

### Request/Data Flow
`Authorization: Bearer` → signature/iss/exp → claims → local user / org actor.

### Configuration
```
spring.security.oauth2.resourceserver.jwt.issuer-uri
spring.security.oauth2.resourceserver.jwt.jwk-set-uri
```

### Testing
Missing/invalid token → 401; role/permission mismatch → 403; converter unit tests in common-library / services.

### Scaling Considerations
Short TTL + Keycloak refresh; optional `aud` hardening per client later.

---

## Keycloak

### Purpose
Sole Identity Provider; issues tokens; owns passwords and SSO.

### Why This Technology
Avoids custom credential stores; aligns with Phase 2; provides stable `sub` for application identity.

### Where It Is Used
Realm `devflow`; clients `devflow-web` / `devflow-gateway`; JWT issuer for all Phase 3 APIs.

### Code-Level Integration
`sub` → `externalIdentityId`; realm roles `ADMIN`/`SUPER_ADMIN` bypass org RBAC; invitation accept compares JWT email to invite email.

### Request/Data Flow
Login in Keycloak → JWT → Gateway → user/org services (no password tables in app DBs).

### Configuration
`KEYCLOAK_URL`, `KEYCLOAK_REALM`, `KEYCLOAK_ISSUER_URI` (see `.env.example`); realm export under `infrastructure/keycloak/`.

### Testing
Mock JWT in unit/API tests; local realm import for manual E2E.

### Scaling Considerations
Externalize HA Keycloak; federated IdPs; never put admin client secret in frontend.

---

## Kafka

### Purpose
Async integration fabric for user/org/team/membership/invitation domain events and auth→user upsert.

### Why This Technology
Durable, scalable pub/sub matching DevFlow microservice boundaries.

### Where It Is Used
- Produce: `UserEventPublisher`, `OrganizationEventPublisher`, auth-service auth events
- Consume: `UserAuthenticatedListener` on `user-authentication-events`
- Topics: see [../events/phase-3-events.md](../events/phase-3-events.md)

### Code-Level Integration
`KafkaTemplate` + `EventEnvelope` (Phase 3); topic constants in `KafkaTopics`.

### Request/Data Flow
Domain commit → publish envelope → consumer upsert/side effects (at-least-once, idempotent).

### Configuration
`spring.kafka.bootstrap-servers`; consumer `group-id=user-service` for auth events.

### Testing
Publisher unit tests assert no secrets in payloads; listener tests with mocked `UserService`.

### Scaling Considerations
Partition by aggregate id; add outbox for transactional publish; consumer groups per downstream service.

---

## Redis

### Purpose
Gateway rate limiting and shared cache substrate (permission/session caches as needed).

### Why This Technology
Low-latency shared state already in Phase 1 Docker stack.

### Where It Is Used
Gateway `RedisRateLimiter`; service `RedisConfig` modules ready for cache; Phase 3 may cache authz results later.

### Code-Level Integration
Spring Data Redis configuration classes under each service; gateway uses Redis for request throttling keys.

### Request/Data Flow
Gateway resolves rate-limit key → Redis increment → allow/deny before proxying to user/org services.

### Configuration
`spring.data.redis.host` / port from Compose (`6379`).

### Testing
Rate-limit tests optional; mock Redis in service unit tests.

### Scaling Considerations
Redis Cluster for multi-gateway; TTL caches for `(userId, orgId)` permission sets.

---

## Bean Validation

### Purpose
Declarative request validation (`@NotBlank`, `@Size`, `@Pattern`, `@Min`/`@Max`).

### Why This Technology
Fail fast at controller boundary; consistent `VALIDATION_FAILED` via `GlobalExceptionHandler`.

### Where It Is Used
DTOs such as `CreateOrganizationRequest`, `CreateInvitationRequest`, `UpdateUserProfileRequest`, `AddTeamMemberRequest`.

### Code-Level Integration
`@Valid` on controller bodies; constraints on slug patterns and `expiresInDays` (1–90).

### Request/Data Flow
HTTP JSON → `@Valid` → ConstraintViolation → `ApiError` details → 400.

### Configuration
Hibernate Validator via `spring-boot-starter-validation`.

### Testing
Controller tests for invalid slug/email/role payloads.

### Scaling Considerations
Keep validation at edge DTOs; business uniqueness (slug/membership) remains DB + 409.

---

## Testcontainers

### Purpose
Real PostgreSQL (and optionally Kafka/Redis) in integration tests.

### Why This Technology
Catches Flyway/SQL/constraint issues that mocks miss.

### Where It Is Used
Service integration test suites under `services/user-service` and `services/organization-service` (where enabled).

### Code-Level Integration
JUnit extension starts PostgreSQL container; Spring datasource overridden for test context.

### Request/Data Flow
Test → Boot context + container DB → Flyway → exercise repositories/APIs → assert.

### Configuration
Docker available to CI/agents; test dependencies in module POM.

### Testing
Use for migration + repository + critical API paths; keep unit tests on Mockito for speed.

### Scaling Considerations
Reuse containers where supported; parallelize modules carefully to avoid Docker pressure.

---

## JUnit 5

### Purpose
Primary test runner for unit and Spring tests.

### Why This Technology
Standard for Spring Boot 3; parameterized tests for roles/permissions matrices.

### Where It Is Used
`src/test/java` across user-service, organization-service, common-library.

### Code-Level Integration
`@Test`, `@ParameterizedTest`, Spring Boot test annotations.

### Request/Data Flow
N/A — drives test execution of service/controller/repository layers.

### Configuration
Surefire/Failsafe via parent Maven POM.

### Testing
`mvn test` / `mvn verify` from `backend/`.

### Scaling Considerations
Keep fast unit tests dominant; reserve heavier IT for critical paths.

---

## Mockito

### Purpose
Isolate services/controllers from JPA, Kafka, and Feign collaborators.

### Why This Technology
Fast, deterministic unit tests for upsert, authz, invitation hashing, event publishing.

### Where It Is Used
`*ServiceTest`, controller tests, event publisher tests (mocked `KafkaTemplate`).

### Code-Level Integration
`@Mock` / `@InjectMocks` or `@MockitoBean` in Spring tests; verify publish calls and Feign interactions.

### Request/Data Flow
Test invokes service → mocks return entities → assert DTO/events/exceptions.

### Configuration
`spring-boot-starter-test` (Mockito included).

### Testing
Assert invitation create returns token once while repository stores hash only; assert no token in Kafka payload.

### Scaling Considerations
Prefer fakes for complex authz graphs if mock setup becomes brittle.

---

## OpenAPI/Swagger

### Purpose
Interactive API docs and contract visibility for frontend integration.

### Why This Technology
springdoc integrates with Spring Security bearer schemes; accelerates Phase 3 client work.

### Where It Is Used
user-service and organization-service springdoc endpoints; `@SecurityRequirement(name = "bearerAuth")` on controllers.

### Code-Level Integration
Annotated controllers/DTOs; Swagger UI behind local profiles as configured.

### Request/Data Flow
Developer opens Swagger → Authorize with JWT → call `/api/users/me`, org/team/invitation APIs.

### Configuration
`springdoc.api-docs` / `swagger-ui` properties per service YAML.

### Testing
Smoke that docs endpoint is public; business APIs remain authenticated.

### Scaling Considerations
Export OpenAPI artifacts to frontend CI; keep contracts mirrored in `documentation/api/*`.

---

## Docker

### Purpose
Local infrastructure and optional service packaging for Phase 3 runtime dependencies.

### Why This Technology
Reproducible Postgres/Kafka/Redis/Keycloak stack for developers.

### Where It Is Used
`infrastructure/docker/docker-compose.yml`; service Dockerfiles as present under modules.

### Code-Level Integration
`application-docker.yml` uses Compose DNS hostnames; DBs `devflow_user` / `devflow_organization`.

### Request/Data Flow
`docker compose up` → infra healthy → run services with profile `local` or `docker` → gateway `:8080`.

### Configuration
`backend/.env.example` (no secrets committed); Keycloak realm import.

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
Root `backend/pom.xml`; modules `common-library`, `gateway-service`, `services/*`.

### Code-Level Integration
`mvn clean install` builds library then services; Failsafe/Surefire for tests.

### Request/Data Flow
N/A — build tool. CI runs same goals as local verify.

### Configuration
Parent dependency management for Boot/Cloud versions; Java 21 release flag.

### Testing
`mvn -pl services/user-service,services/organization-service -am verify`.

### Scaling Considerations
Module-scoped CI jobs; keep common-library versioned with reactor build to avoid drift.
