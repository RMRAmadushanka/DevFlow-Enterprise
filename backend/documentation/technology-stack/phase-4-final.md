# Phase 4 — Final Technology Summary

Technologies **actually used** by DevFlow Project Management (`project-service` and its integration surface).  
Claims removed or marked if not used: MapStruct (dep only), Redis domain cache (config only), Testcontainers Kafka (dep only).

---

## Java 21

### What It Does
Language and runtime for project-service and common-library.

### Why DevFlow Uses It
LTS, records for DTOs/`EventEnvelope`, aligns with Spring Boot 3.

### Where It Is Used
All modules under `backend/services/project-service`, `backend/common-library`.

### Actual Code Integration
Records (`ProjectResponse`, `EventEnvelope`), switch expressions (`PageSupport.parseSort`), `List.getFirst()`.

### Configuration
Parent `pom.xml` → `java.version` / `maven.compiler.release=21`.

### Data Flow
N/A (language).

### Testing
JUnit 5 on JDK 21 (verified with local Maven).

### Scaling
Horizontal process scale; virtual threads optional later for Feign.

### Security Considerations
Keep runtime patched; no language-specific secrets.

### Alternatives Considered
Java 17 — rejected to stay on current Boot 3 / team baseline.

---

## Spring Boot 3

### What It Does
Application runtime: DI, web, security, JPA, Kafka, Actuator, validation.

### Why DevFlow Uses It
Consistent microservice platform across Phases 1–4.

### Where It Is Used
`ProjectServiceApplication`, all `@Service` / `@RestController` / `@Configuration`.

### Actual Code Integration
`@SpringBootApplication`, `@EnableFeignClients`, `@EnableScheduling`, profile-specific YAML.

### Configuration
`application.yml`, `application-local.yml`, `application-docker.yml`.

### Data Flow
HTTP → Security → Controller → Service → JPA / Feign / Outbox.

### Testing
`@WebMvcTest`, `@DataJpaTest`, `@ExtendWith(MockitoExtension.class)`.

### Scaling
Independent deployable JAR behind gateway.

### Security Considerations
Disable CSRF for Bearer APIs; keep Actuator exposure limited.

### Alternatives Considered
Quarkus / Micronaut — rejected for ecosystem consistency.

---

## Spring Web MVC

### What It Does
REST controllers and JSON HTTP APIs.

### Why DevFlow Uses It
Idiomatic Boot REST for project resources.

### Where It Is Used
`controller/Project*.java`, `HealthController`.

### Actual Code Integration
`@RestController`, `@RequestMapping("/api/projects")`, `@Valid` bodies.

### Configuration
`server.port=8084`.

### Data Flow
Gateway → controller → `ApiResponse` envelope.

### Testing
`ProjectControllerUnauthorizedTest`, `HealthControllerTest`.

### Scaling
Stateless; scale instances behind gateway.

### Security Considerations
`@PreAuthorize("isAuthenticated()")` on controllers.

### Alternatives Considered
WebFlux — unnecessary for this service’s I/O pattern.

---

## Spring Data JPA + Hibernate

### What It Does
ORM persistence for project aggregates.

### Why DevFlow Uses It
Transactional domain writes + repository queries.

### Where It Is Used
`entity/*`, `repository/*`, services with `@Transactional`.

### Actual Code Integration
`JpaRepository`, Specifications for list filters, `@Version` optimistic locking.

### Configuration
`spring.jpa.hibernate.ddl-auto=validate`, `open-in-view=false`.

### Data Flow
Service TX → EntityManager → PostgreSQL.

### Testing
`ProjectRepositoryIT` (Testcontainers), unit tests with mocked repos.

### Scaling
Connection pool via Boot defaults; add read replicas later if needed.

### Security Considerations
Parameterized queries via JPA; no string-concat SQL in domain paths (outbox claim is parameterized native SQL).

### Alternatives Considered
jOOQ / MyBatis — higher ceremony for CRUD-heavy Phase 4.

---

## PostgreSQL 16

### What It Does
System of record for `devflow_project`.

### Why DevFlow Uses It
Shared DevFlow datastore family; JSONB for activity/outbox payload; SKIP LOCKED for outbox.

### Where It Is Used
Docker `postgres` service; JDBC URL `.../devflow_project`.

### Actual Code Integration
Flyway migrations V1–V10; native outbox claim query.

### Configuration
`DB_URL`, `DB_USERNAME`, `DB_PASSWORD`; compose init creates DB.

### Data Flow
App → JDBC → PostgreSQL.

### Testing
Testcontainers `postgres:16-alpine` when Docker available.

### Scaling
Vertical + connection pooling; partition later if activity volume grows.

### Security Considerations
Dedicated DB user; no cross-service FKs.

### Alternatives Considered
MySQL — rejected for JSONB/SKIP LOCKED consistency with other services.

---

## Flyway

### What It Does
Versioned schema migrations.

### Why DevFlow Uses It
Repeatable, ordered schema evolution with `ddl-auto=validate`.

### Where It Is Used
`resources/db/migration/V1`–`V10`.

### Actual Code Integration
`spring.flyway.enabled=true`, locations `classpath:db/migration`.

### Configuration
Default Boot Flyway auto-config.

### Data Flow
Startup migrate → validate Hibernate model.

### Testing
Repository IT runs Flyway against Testcontainers.

### Scaling
Migrate once per environment; avoid concurrent conflicting migrators.

### Security Considerations
Migration files are code — review for destructive changes.

### Alternatives Considered
Liquibase — Flyway already standard in DevFlow.

---

## Spring Security + OAuth2 Resource Server

### What It Does
Validates Keycloak JWTs and enforces authentication.

### Why DevFlow Uses It
Single authN model shared with other services.

### Where It Is Used
`SecurityConfig`, `@EnableMethodSecurity`, `@PreAuthorize`.

### Actual Code Integration
`oauth2ResourceServer().jwt()` + `KeycloakJwtAuthenticationConverter`.

### Configuration
`KEYCLOAK_ISSUER_URI`, `KEYCLOAK_JWK_SET_URI`, `devflow.security.jwt.client-id`, `devflow.security.openapi-public`.

### Data Flow
Bearer JWT → JwtDecoder → SecurityContext → service authz.

### Testing
WebMvc unauthorized tests; JwtDecoder mocked.

### Scaling
Stateless JWT validation; JWKS cache via Boot.

### Security Considerations
Swagger/OpenAPI gated by `openapi-public`; never trust body roles.

### Alternatives Considered
Custom session auth — rejected (Keycloak owns sessions).

---

## Keycloak

### What It Does
OIDC IdP issuing access tokens.

### Why DevFlow Uses It
Central identity; project-service is resource server only.

### Where It Is Used
Token issuer for JWT validation; compose `keycloak` service.

### Actual Code Integration
Issuer/JWKS URIs in YAML; realm roles ADMIN/SUPER_ADMIN bypass project checks.

### Configuration
`KEYCLOAK_*` env vars in `.env.example`.

### Data Flow
Browser/login → Keycloak → JWT → Gateway → project-service.

### Testing
Not started in unit suite; integration requires Compose.

### Scaling
Keycloak cluster separately from project-service.

### Security Considerations
No passwords stored in project-service.

### Alternatives Considered
Auth0 / Cognito — Keycloak already deployed in Phase 2.

---

## OpenFeign

### What It Does
Typed HTTP clients to user-service and organization-service.

### Why DevFlow Uses It
Sync identity resolve + org permission checks without duplicating data.

### Where It Is Used
`UserClient`, `OrganizationClient`, `FeignClientConfig`, `CurrentUserResolver`, authz/member/transfer.

### Actual Code Integration
`@FeignClient` + interceptor for Authorization / X-Correlation-Id.

### Configuration
`devflow.clients.user-service-url`, `organization-service-url`.

### Data Flow
project-service → Feign → peer REST → deny/allow.

### Testing
Clients mocked in unit tests.

### Scaling
Timeouts/retries via Feign/Boot; cache org perms later.

### Security Considerations
Fail-closed on Feign errors for org permissions.

### Alternatives Considered
Kafka request/reply — too heavy for authz path.

---

## Apache Kafka + Spring Kafka

### What It Does
Async domain event bus for project facts.

### Why DevFlow Uses It
Decouple future consumers; match Phase 3 event architecture.

### Where It Is Used
`OutboxPublisher` + `KafkaTemplate`; topic `project-events`.

### Actual Code Integration
Only outbox poller publishes; domain never calls KafkaTemplate.

### Configuration
`KAFKA_BOOTSTRAP_SERVERS`; `KafkaConfig` topic bean.

### Data Flow
DB outbox → poller → Kafka (key=aggregateId).

### Testing
`OutboxPublisherTest` mocks `KafkaTemplate` (no broker required).

### Scaling
Partitions (3 local); consumer groups in later phases.

### Security Considerations
No secrets in event payloads; ACL Kafka in prod.

### Alternatives Considered
Direct Kafka from services — rejected for dual-write risk.

---

## Transactional Outbox

### What It Does
Atomically records event intent with domain writes; publishes after commit.

### Why DevFlow Uses It
Reliable messaging without 2PC.

### Where It Is Used
`outbox_events`, `OutboxService`, `OutboxPublisher`.

### Actual Code Integration
Enqueue in same `@Transactional`; claim with `FOR UPDATE SKIP LOCKED`.

### Configuration
`devflow.outbox.poll-interval-ms`, `batch-size`.

### Data Flow
Domain TX → PENDING row → claim → publish → PUBLISHED/FAILED.

### Testing
`OutboxServiceTest`, `OutboxPublisherTest`.

### Scaling
Multi-instance safe via SKIP LOCKED; monitor FAILED rows.

### Security Considerations
Stores correlation id; payloads must stay non-sensitive.

### Alternatives Considered
Debezium CDC — deferred complexity.

---

## springdoc OpenAPI

### What It Does
Generates OpenAPI docs / Swagger UI.

### Why DevFlow Uses It
Contract visibility for gateway/frontend developers.

### Where It Is Used
`OpenApiConfig`, `@Operation` / `@SecurityRequirement` on controllers.

### Actual Code Integration
Bearer scheme `bearerAuth`; springdoc paths in YAML.

### Configuration
`springdoc.api-docs.path`, `swagger-ui.path`; `openapi-public` security flag.

### Data Flow
Runtime reflection → `/v3/api-docs`.

### Testing
Manual when service running.

### Scaling
N/A.

### Security Considerations
Disable public OpenAPI in non-local (`openapi-public=false`).

### Alternatives Considered
Hand-written OpenAPI only — rejected for drift risk.

---

## MapStruct — NOT USED (dependency only)

Present in `pom.xml` / annotation processor path; mappers are hand-written `@Component` classes (`ProjectMapper`, etc.). Do not treat as active Phase 4 technology.

---

## Redis — INFRA WIRED, DOMAIN UNUSED

`RedisConfig` / `StringRedisTemplate` exist; **no** `@Cacheable` or domain usage in project-service. Gateway/rate-limit may use Redis elsewhere. Not a Phase 4 project domain dependency.

---

## Testcontainers (PostgreSQL)

### What It Does
Ephemeral Postgres for repository ITs.

### Why DevFlow Uses It
Real Flyway/constraint verification.

### Where It Is Used
`ProjectRepositoryIT` (`disabledWithoutDocker = true`).

### Actual Code Integration
`PostgreSQLContainer("postgres:16-alpine")`.

### Configuration
None beyond test class.

### Data Flow
IT → container JDBC → Flyway → assertions.

### Testing
Skipped when Docker CLI missing.

### Scaling
CI with Docker.

### Security Considerations
Ephemeral credentials in tests only.

### Alternatives Considered
H2 — rejected (Postgres CHECK/JSONB/SKIP LOCKED differences).

---

## JUnit 5 + Mockito + Spring Security Test

### What It Does
Unit and slice testing.

### Why DevFlow Uses It
Fast feedback without full stack.

### Where It Is Used
`src/test/java` under project-service and common-library.

### Actual Code Integration
Mockito for collaborators; `@WithMockUser` / Security filter tests.

### Configuration
Surefire `bytebuddy.experimental` for newer JDKs.

### Data Flow
N/A.

### Testing
Self.

### Scaling
Parallel surefire later if needed.

### Security Considerations
Never embed real secrets in tests.

### Alternatives Considered
Spock — rejected for Java consistency.

---

## API Gateway (Spring Cloud Gateway)

### What It Does
Edge routing for `/api/projects/**` → project-service.

### Why DevFlow Uses It
Single public entry + CORS + correlation.

### Where It Is Used
`gateway-service` route `project-service`, `PROJECT_SERVICE_URL`.

### Actual Code Integration
Compose + `application.yml` predicates.

### Configuration
`PROJECT_SERVICE_URL`, `CORS_ALLOWED_ORIGINS`.

### Data Flow
Client → `:8080` → `:8084`.

### Testing
Not covered by project-service unit suite.

### Scaling
Scale gateway independently.

### Security Considerations
JWT validation at edge + resource server defense-in-depth.

### Alternatives Considered
Direct browser→service — rejected for prod topology.

---

## Next.js Project UI (integration surface)

### What It Does
Project pages/hooks; optional HTTP via flag.

### Why DevFlow Uses It
Existing frontend product surface.

### Where It Is Used
`frontend/src/features/projects/**`.

### Actual Code Integration
Mock default; `project-api.service.ts` + mappers when `NEXT_PUBLIC_USE_PROJECT_API=true`.

### Configuration
`NEXT_PUBLIC_API_BASE_URL`, `NEXT_PUBLIC_USE_PROJECT_API`.

### Data Flow
UI → (optional) apiClient → gateway → project-service.

### Testing
Vitest mapper tests.

### Scaling
SSR/static Next patterns unchanged.

### Security Considerations
Bearer attached only when session provides `accessToken` (session wiring still stubbed).

### Alternatives Considered
Rewrite UI for Phase 4 — rejected (minimal integration only).
