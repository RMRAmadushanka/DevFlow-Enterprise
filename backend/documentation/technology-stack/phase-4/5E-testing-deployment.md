# Phase 4 / 5E — Testing, Integration & Local Deployment

Production-readiness notes for **project-service** and Project UI integration.

---

## Docker

| | |
|---|---|
| **Purpose** | Run infra + optional app containers locally |
| **Why used** | Reproducible PostgreSQL, Kafka, Redis, Keycloak, gateway, and services |
| **Where** | `infrastructure/docker/docker-compose.yml` — `project-service` under profile `apps` |
| **Code / config** | Image build from `services/project-service`; env `SPRING_PROFILES_ACTIVE=docker`; DB `devflow_project`; Feign URLs to user/org; Kafka `kafka:29092` |
| **Local flow** | Infra: `docker compose up -d` (postgres/redis/kafka/keycloak). Apps: `docker compose --profile apps up -d --build` |
| **Failure handling** | Healthchecks on postgres/redis/kafka; service `depends_on` gates |
| **Testing** | Compose itself is validated by ops; unit suite does not require Compose |
| **Scaling** | Single replica locally; production would use orchestrator + multi-broker Kafka |

`project-service` already depends on postgres, redis, kafka, keycloak, user-service, organization-service. Gateway depends on project-service and sets `PROJECT_SERVICE_URL`.

---

## Testcontainers

| | |
|---|---|
| **Purpose** | Real PostgreSQL for repository/Flyway ITs |
| **Why used** | Catch migration/constraint issues without shared local DB pollution |
| **Where** | `ProjectRepositoryIT` (`disabledWithoutDocker = true`) |
| **Code** | `@Testcontainers` + `PostgreSQLContainer("postgres:16-alpine")` |
| **Failure handling** | Auto-skip when Docker CLI unavailable |
| **Testing** | Unique key constraint + Flyway schema smoke |
| **Scaling** | CI runners with Docker-in-Docker or sibling Docker socket |

---

## JUnit

| | |
|---|---|
| **Purpose** | Unit / slice / IT runner |
| **Why used** | Standard Spring Boot 3 test stack |
| **Where** | `services/project-service/src/test` |
| **Coverage areas** | Domain rules, authz matrix, services, outbox publisher, WebMvc security, health |

---

## Mockito

| | |
|---|---|
| **Purpose** | Isolate collaborators (repos, Feign, KafkaTemplate, CurrentUserResolver) |
| **Why used** | Fast tests without infra |
| **Where** | `*ServiceTest`, `OutboxPublisherTest`, controller `@MockBean` |

---

## Integration testing

| Layer | Approach |
|---|---|
| Repository / DB | Testcontainers PostgreSQL + Flyway |
| HTTP security | `@WebMvcTest` + `SecurityConfig` (401 without JWT; authenticated pass-through) |
| Kafka | Mock `KafkaTemplate` in unit tests (no broker required) |
| Cross-service | Feign clients mocked in unit tests; live Feign requires running user/org |

---

## API testing

- Contract: [project-api-contract.md](../../api/project-api-contract.md)
- OpenAPI: `http://localhost:8084/swagger-ui.html` (or via gateway if exposed)
- Manual smoke (when stack up): create → list → patch status → archive → restore with Bearer JWT

---

## Database testing

- Flyway `V1`–`V10` under `resources/db/migration`
- Constraints: unique org+key, org+slug, member/tag/favorite pairs
- Soft archive / member `REMOVED` semantics covered in domain + IT where Docker available

---

## Kafka testing

- Outbox enqueue + publish unit tests (`OutboxServiceTest`, `OutboxPublisherTest`)
- Assert envelope fields, correlation id, retry → FAILED, no secret keys in payload
- Topic `project-events` created by kafka-init scripts

---

## Local development

```bash
# 1) Infra
cd backend/infrastructure/docker
docker compose up -d postgres redis kafka kafka-init keycloak

# 2) Services (JVM) — from backend/
# Use portable Maven if needed: .tools/apache-maven-3.9.6/bin/mvn.cmd
mvn -pl services/user-service,services/organization-service,services/project-service,gateway-service -am spring-boot:run
# (or run each module / IDE run configs with profile local)

# 3) Frontend (mock by default)
cd frontend
# Optional live API:
# NEXT_PUBLIC_USE_PROJECT_API=true
# NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
npm run dev
```

Config files:

| File | Role |
|---|---|
| `.env.example` | Template secrets/URLs (never commit real secrets) |
| `application.yml` | Defaults (local JDBC, Keycloak issuer, Feign, outbox) |
| `application-local.yml` | Local profile overrides |
| `application-docker.yml` | Docker DNS hostnames |

---

## Configuration

| Variable | Purpose |
|---|---|
| `DB_URL` / credentials | `devflow_project` PostgreSQL |
| `KAFKA_BOOTSTRAP_SERVERS` | Broker |
| `REDIS_HOST` | Cache/session infra (shared stack) |
| `KEYCLOAK_ISSUER_URI` / `JWK_SET_URI` | JWT validation |
| `USER_SERVICE_URL` / `ORGANIZATION_SERVICE_URL` | Feign |
| `NEXT_PUBLIC_USE_PROJECT_API` | Frontend switches mock → HTTP |
| `NEXT_PUBLIC_API_BASE_URL` | Gateway base for SSR/fetch |

---

## Deployment considerations

- Run Flyway before/at startup (`ddl-auto: validate`)
- Ensure `project-events` topic exists (or rely on auto-create carefully)
- Restrict Swagger in production networks
- Monitor outbox `FAILED` rows / `last_error`
- Horizontal scale of outbox pollers needs claim/locking (future)
- Never log JWTs/passwords; correlation id only

---

## Frontend UI states

Existing Project UI components already cover loading skeletons, empty states, error toasts, and success mutations via React Query hooks. With API mode:

| State | Behavior |
|---|---|
| loading / empty / error / success | Hooks + list/detail shells |
| 401 / 403 | Mapped to `ProjectPermissionError` |
| pagination / search / filter / sort | Query params via mappers |
| archive / restore / favorites | Dedicated endpoints |
| members / settings / tags / activity | Dedicated APIs exist; UI still partly mock-detail until wired |

Out-of-scope Phase 4 widgets (analytics, repo, environments) remain empty/minimal when API mode is on.
