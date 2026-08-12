# Phase 1 Technologies

Enterprise backend foundation for DevFlow. Each section covers purpose, rationale, placement, integration, examples, configuration, and scaling notes.

---

## Java 21

### Purpose
Primary language for all microservices and the shared library.

### Why chosen
- LTS release with virtual threads, pattern matching, and records
- Strong Spring Boot 3 support
- Enterprise hiring / ops familiarity

### Where used
- Every module under `backend/`
- `common-library` shared types (`ApiResponse`, `DomainEvent`, `BaseEntity`)

### Code integration
- `maven.compiler.release=21`
- Records for API envelopes and events

### Example classes
- `com.devflow.common.api.ApiResponse`
- `com.devflow.auth.AuthServiceApplication`

### Configuration
Parent `pom.xml` → `<java.version>21</java.version>`

### Future scaling
Adopt virtual threads for high-fanout I/O (notifications, gateway filters) where beneficial.

---

## Spring Boot 3

### Purpose
Application runtime: DI, autoconfiguration, Actuator, Security, Data, Kafka.

### Why chosen
- De-facto Java microservice framework
- First-class OAuth2 resource server + OpenAPI ecosystem
- Matches enterprise SaaS expectations

### Where used
All `*-service` modules and `gateway-service`.

### Code integration
Controller → Service → Repository flow (business logic in later phases):

```
HealthController  →  (future XxxService)  →  (future XxxRepository)
```

Phase 1 only exposes foundation health controllers.

### Example
`services/auth-service/.../controller/HealthController.java`

### Configuration
- `application.yml` / `application-local.yml` / `application-docker.yml`
- Profile `local` for laptop + Docker infra
- Profile `docker` for in-compose networking

### Future scaling
Extract modules to independently deployable images; keep Boot starters aligned via parent BOM.

---

## Spring Cloud Gateway

### Purpose
Single edge entry for the Next.js frontend and external clients.

### Why chosen
- Reactive, non-blocking routing
- Native Redis rate limiting
- JWT resource-server integration

### Where used
`gateway-service` on port `8080`.

### Integration / request flow

```
Frontend (Next.js :3000)
        ↓
API Gateway (:8080)  — CORS, correlation id, JWT, rate limit
        ↓
Microservice (:808x)
```

### Routes (foundation)
| Predicate | Target |
|---|---|
| `/api/auth/**`, `/api/v1/auth/**` | auth-service |
| `/api/users/**`, `/api/v1/user/**` | user-service |
| `/api/projects/**`, `/api/v1/project/**` | project-service |
| … | see `gateway-service/src/main/resources/application.yml` |

### Configuration
- `CorrelationIdGatewayFilter`
- `AuthenticationHeaderRelayFilter` (`Authorization`, `X-User-Id`)
- `RedisRateLimiter` + `ipKeyResolver` (enabled when rate-limit filters active)

### Future scaling
Add circuit breakers, per-route authz claims, OpenTelemetry tracing propagation.

---

## OpenFeign

### Purpose
Declarative REST clients between services.

### Why chosen
Spring Cloud first-class support; easy to mock in tests.

### Where used
`@EnableFeignClients` on each service application (clients added in later phases).

### Future scaling
Combine with load balancer / service discovery (Kubernetes DNS or Eureka/Consul if needed).

---

## PostgreSQL

### Purpose
System of record for relational domains.

### Why chosen
ACID, JSONB, mature ops story, Flyway-friendly.

### Tables (Phase 1)
Each service DB contains Flyway `V1__initial.sql` → `schema_foundation` marker only.

### Services using it
auth, user, organization, project, task, sprint, document, repository, deployment, notification, analytics, audit (logical DBs `devflow_*`).

### Configuration
Docker: `infrastructure/docker/docker-compose.yml` + init script creating per-service databases.

### Future scaling
Read replicas for analytics; optional RLS for tenant isolation.

---

## MongoDB

### Purpose
Document / append-oriented storage.

### Why chosen
Flexible documents for knowledge base content, notification outbox, audit streams.

### Collections
See `infrastructure/mongodb/collections-strategy.md`. None created in Phase 1 (lazy).

### Services using it
- document-service
- notification-service
- audit-service

### Configuration
`spring.data.mongodb.uri` in those services.

### Future scaling
Sharding by `organizationId`; TTL indexes on notifications.

---

## Redis

### Purpose
Cache, gateway rate limiting, future session/token denylist.

### Why chosen
Ubiquitous, fast, Spring Data Redis support.

### Cache strategy (Phase 1)
- Gateway: Redis rate limiter foundation
- Services: `StringRedisTemplate` bean wired — no domain keys yet

### Code integration
`config/RedisConfig.java` in each service; gateway reactive Redis starter.

### Future scaling
Cache permission sets `perm:{userId}:{orgId}`; pub/sub for soft real-time.

---

## Apache Kafka

### Purpose
Async domain events between services.

### Why chosen
Enterprise event backbone; KRaft removes ZooKeeper complexity for local/dev.

### Event communication
Topics:

| Topic | Constant |
|---|---|
| user-events | `KafkaTopics.USER_EVENTS` |
| project-events | `KafkaTopics.PROJECT_EVENTS` |
| task-events | `KafkaTopics.TASK_EVENTS` |
| notification-events | `KafkaTopics.NOTIFICATION_EVENTS` |
| audit-events | `KafkaTopics.AUDIT_EVENTS` |

### Producer / Consumer
- Phase 1: topic auto-create beans + infra `kafka-init`
- Later: publish `DomainEvent` envelopes; consumers in notification/audit/analytics

### Configuration
Local bootstrap `localhost:9092`; docker internal `kafka:29092`.

### Future scaling
Schema Registry (Avro/JSON Schema), partitioning by `organizationId`.

---

## Keycloak

### Purpose
Identity provider — OIDC login, roles, JWT issuance.

### Why chosen
Open-source IdP; realm import; standard JWT validation in Spring.

### Authentication flow

```
User → Keycloak (password / social later)
     → Access token (JWT)
     → Gateway validates JWT
     → Downstream services validate JWT (resource servers)
```

### JWT lifecycle
- Issuer: `http://localhost:8180/realms/devflow`
- Roles claim: `realm_access.roles` → `ADMIN` | `MANAGER` | `DEVELOPER` | `VIEWER`
- Clients: `devflow-frontend` (public PKCE), `devflow-gateway` (confidential)

### Configuration
Realm JSON: `infrastructure/keycloak/realm-devflow.json`

### Future scaling
Org-level roles mapped to custom claims; token exchange for M2M; SAML for enterprise SSO.

---

## Docker

### Purpose
Package runtime dependencies and optional service images.

### Containers (Phase 1 infra)
postgres, mongo, redis, kafka, kafka-init, keycloak

### Development workflow
1. `docker compose up -d` for infra
2. Run services via Maven on the host (fast feedback)
3. Optional `--profile apps` for containerized gateway

### Future scaling
CI builds images per service; Kubernetes Deployments/Services.

---

## Docker Compose

### Purpose
One-command local infrastructure.

### Local infrastructure
File: `infrastructure/docker/docker-compose.yml`

```bash
docker compose -f infrastructure/docker/docker-compose.yml up -d
```

### Future scaling
Override files per environment (`compose.prod.yml`); secrets via Docker/K8s secrets.

---

## Flyway

### Purpose
Versioned SQL migrations per service database.

### Why chosen
Pairs cleanly with Spring Boot; explicit schema history.

### Database migration
Path: `src/main/resources/db/migration/V1__initial.sql`

Phase 1 creates `schema_foundation` only.

### Future scaling
Strict expand/contract migrations; separate migration CI job.

---

## Swagger / OpenAPI (springdoc)

### Purpose
Interactive API documentation per service.

### Why chosen
OpenAPI 3 + Swagger UI with Spring Boot 3 support.

### Endpoints
- `/swagger-ui.html`
- `/v3/api-docs`

Bearer JWT security scheme registered in `OpenApiConfig`.

### Future scaling
Aggregate gateway-level docs or external developer portal.

---

## Spring Actuator

### Purpose
Health and ops endpoints for each service.

### Exposed (foundation)
`health`, `info`, `metrics`, `prometheus` (where configured)

### Future scaling
Wire OpenTelemetry; Kubernetes probes on `/actuator/health/liveness|readiness`.

---

## Maven multi-module

### Purpose
Unified dependency BOM and reactor build.

### Modules
`common-library`, `gateway-service`, twelve domain services under `services/`.

### Commands
```bash
mvn clean install
mvn -pl services/task-service -am spring-boot:run
```

---

## Logging (SLF4J + Logback)

### Purpose
Structured console logs with correlation id.

### Integration
- `CorrelationIdFilter` (servlet services)
- `CorrelationIdGatewayFilter` (gateway)
- MDC key `correlationId`
- `logback-spring.xml` per service

---

## Testing foundation

| Tool | Use |
|---|---|
| JUnit 5 | Unit / slice tests |
| Mockito | Via spring-boot-starter-test |
| `@WebMvcTest` | Controller smoke tests |
| `@SpringBootTest` | Gateway context smoke test |

---

## Phase 1 success criteria

- [x] Multi-module Maven build structure
- [x] Common library with `ApiResponse` + global errors
- [x] Gateway routes + CORS + JWT + rate-limit foundation
- [x] Twelve service templates with standard packages
- [x] Postgres / Mongo / Redis / Kafka / Keycloak via Compose
- [x] Flyway stub migrations
- [x] OpenAPI + Actuator on services
- [x] Example tests + README + technology guide
