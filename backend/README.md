# DevFlow Enterprise Backend

Java 21 / Spring Boot 3 microservices.

- **Phase 1:** infrastructure foundation  
- **Phase 2:** Keycloak authentication / JWT resource servers  
- **Phase 3:** User Service, Organization Service, teams, memberships, RBAC, invitations  
- **Phase 4:** Project Service (port `8084`) — projects, members, settings, tags, favorites, activity, transactional outbox

## Stack

| Layer | Technology |
|---|---|
| Language | Java 21 |
| Framework | Spring Boot 3.3 |
| Build | Maven (multi-module) |
| Gateway | Spring Cloud Gateway |
| Service calls | OpenFeign |
| SQL DB | PostgreSQL 16 + Flyway |
| Document DB | MongoDB 7 |
| Cache | Redis 7 |
| Messaging | Apache Kafka (KRaft) |
| Auth | Keycloak (JWT resource server) |
| API docs | springdoc OpenAPI |
| Ops | Spring Actuator |
| Local runtime | Docker Compose |

## Repository layout

```
backend/
├── pom.xml                 # Parent BOM
├── common-library/         # Shared ApiResponse, exceptions, security, Kafka constants
├── gateway-service/        # Edge routing, CORS, JWT, rate-limit foundation
├── services/               # Domain microservices (templates)
├── infrastructure/         # Docker, Postgres, Mongo, Redis, Kafka, Keycloak
├── documentation/          # Phase technology guides + API contracts
├── scripts/                # Service scaffolder
└── .env.example
```

## Prerequisites

- JDK 21+
- Maven 3.9+
- Docker Desktop / Docker Engine + Compose

## 1. Start infrastructure

```bash
cd backend
cp .env.example .env

docker compose -f infrastructure/docker/docker-compose.yml up -d
```

This starts:

| Service | Host port |
|---|---|
| PostgreSQL | 5432 |
| MongoDB | 27017 |
| Redis | 6379 |
| Kafka | 9092 |
| Keycloak | 8180 |

Keycloak admin: `http://localhost:8180` — user `admin` / `admin`  
Realm import: `devflow` (see `infrastructure/keycloak/README.md`)

## 2. Build all modules

```bash
cd backend
mvn clean install -DskipTests
```

With tests:

```bash
mvn clean verify
```

## 3. Run a single service (example)

```bash
cd backend/services/auth-service
mvn spring-boot:run -Dspring-boot.run.profiles=local
```

Health (no auth):

```bash
curl http://localhost:8081/api/v1/auth/health
curl http://localhost:8081/actuator/health
```

Swagger UI:

```
http://localhost:8081/swagger-ui.html
```

## 4. Run API Gateway

```bash
cd backend/gateway-service
mvn spring-boot:run -Dspring-boot.run.profiles=local
```

Gateway: `http://localhost:8080`

Example routed health:

```bash
curl http://localhost:8080/api/v1/auth/health
```

> JWT-protected routes require a Keycloak bearer token (except auth health paths configured as permitAll).

## 5. Service ports

| Service | Port |
|---|---|
| gateway-service | 8080 |
| auth-service | 8081 |
| user-service | 8082 |
| organization-service | 8083 |
| project-service | 8084 |
| task-service | 8085 |
| sprint-service | 8086 |
| document-service | 8087 |
| repository-service | 8088 |
| deployment-service | 8089 |
| notification-service | 8090 |
| analytics-service | 8091 |
| audit-service | 8092 |

## 6. Test

```bash
# All modules
mvn test

# One module
mvn -pl services/auth-service -am test
```

Foundation includes JUnit 5 + Mockito via `spring-boot-starter-test`, plus auth-service security/controller tests and common-library unit tests.

## 7. Debug

- Set breakpoint in IDE; run Spring Boot main class with profile `local`
- Correlation id header: `X-Correlation-Id` (auto-generated if missing)
- Actuator: `/actuator/health`, `/actuator/info`, `/actuator/metrics`
- Logs include `[corr=...]` via Logback / MDC
- Never log Authorization headers, JWTs, or client secrets

## 8. Docker apps profile (optional)

After `mvn -DskipTests package`:

```bash
docker compose -f infrastructure/docker/docker-compose.yml --profile apps up -d \
  auth-service user-service organization-service gateway-service
```

## Documentation

- [Phase 1 technology guide](documentation/technology-stack/phase-1-backend-foundation.md)
- [Phase 2 authentication guide](documentation/technology-stack/phase-2-authentication.md)
- [Phase 3 user/organization guide](documentation/technology-stack/phase-3-user-organization.md)
- [Phase 4 project guide](documentation/technology-stack/phase-4-project.md)
- [API contracts](documentation/api/) (auth, user, org, team, membership, invitation, project)
- [Project architecture](documentation/architecture/project-architecture.md)
- [Frontend project API mapping](documentation/frontend/project-feature-api-mapping.md)
- [CHANGELOG](CHANGELOG.md)
- Infrastructure READMEs under `infrastructure/*`

## Phase boundaries

**Phase 3 in scope:** application users (`externalIdentityId` = Keycloak `sub`), organizations, teams, memberships, org RBAC/permissions, invitation foundation, Kafka domain events, Feign user↔org integration.

**Phase 4 in scope:** `project-service` on port **8084** (`devflow_project`) — project CRUD/archive/restore, ownership transfer, members, settings, tags, favorites, activity, org Feign permission checks, transactional outbox → `project-events`.

**Out of scope (later):** Task/Sprint/Board/Repository/Environments/Analytics business modules, project duplicate API, invitation email delivery, production HA.
