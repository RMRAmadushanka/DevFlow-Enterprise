# Phase 4 / Prompt 5A — Technology Analysis (Discovered Stack)

**Scope:** Technologies actually present in the DevFlow repository during Project Management analysis.  
**Not a claim that Project Service must be built from scratch** — several pieces already power `project-service`.

For each technology:

### Purpose  
### Where currently used  
### Existing code location  
### Why Project Service should reuse it  
### How it will integrate with Project Service  

---

## Java 21

### Purpose
Primary language for all backend microservices.

### Where currently used
Entire `backend/` multi-module Maven build (`maven.compiler.release=21`).

### Existing code location
Parent `backend/pom.xml`; all `*-service` modules including `services/project-service`.

### Why Project Service should reuse it
Matches platform standard; records, modern APIs, LTS.

### How it will integrate with Project Service
Project domain code remains Java 21; no alternate runtime.

---

## Spring Boot 3

### Purpose
Application runtime: DI, Actuator, Security, Data, Kafka, validation.

### Where currently used
auth, user, organization, project, gateway, and other scaffolded services.

### Existing code location
`*Application.java` mains; `application.yml` / `application-local.yml` / `application-docker.yml`.

### Why Project Service should reuse it
Consistent ops, security, and testing with sibling services.

### How it will integrate with Project Service
`ProjectServiceApplication` on port `8084` with profiles `local` / `docker`.

---

## Spring Cloud Gateway

### Purpose
Single edge entry: routing, JWT gate, CORS, Redis rate limit, correlation ID.

### Where currently used
`gateway-service` (port `8080`).

### Existing code location
`backend/gateway-service/src/main/resources/application.yml` — route id `project-service` → `/api/projects/**`, `/api/v1/project/**`.

### Why Project Service should reuse it
Frontend must not call project-service directly in production topologies.

### How it will integrate with Project Service
`PROJECT_SERVICE_URL` (local `http://localhost:8084`, docker `http://project-service:8084`).

---

## Spring Security + OAuth2 Resource Server

### Purpose
Validate Keycloak JWTs; method security; JSON 401/403.

### Where currently used
auth-service, user-service, organization-service, project-service, gateway.

### Existing code location
`.../config/SecurityConfig.java` per service; common `KeycloakJwtAuthenticationConverter`.

### Why Project Service should reuse it
Independent JWT validation (do not trust gateway alone).

### How it will integrate with Project Service
Bearer JWT on all business routes; `@EnableMethodSecurity`; actor from SecurityContext.

---

## Keycloak

### Purpose
Identity Provider: login, passwords, OIDC, JWT issuance, realm roles.

### Where currently used
`infrastructure/keycloak/`; issuer `http://localhost:8180/realms/devflow`.

### Existing code location
Realm export `realm-devflow.json`; JWT issuer URI in each service YAML.

### Why Project Service should reuse it
No password storage in project DB; `sub` remains external identity root.

### How it will integrate with Project Service
JWT validation only; user UUID via user-service using `sub` → `externalIdentityId`.

---

## User Service

### Purpose
Application user profiles keyed by Keycloak `sub`.

### Where currently used
Port `8082`, DB `devflow_user`.

### Existing code location
`services/user-service` — `/api/users/me`, `/by-external-id/{id}`, `/{userId}`.

### Why Project Service should reuse it
Resolve actor and validate member userIds without duplicating users.

### How it will integrate with Project Service
OpenFeign `UserClient` + Authorization header relay.

---

## Organization Service

### Purpose
Organizations, teams, org memberships, org-level RBAC (including `project.*` codes).

### Where currently used
Port `8083`, DB `devflow_organization`.

### Existing code location
`GET /api/organizations/{orgId}/members/{userId}/permissions`; Flyway V4 seeds `project.*`; V7 grants ADMIN/MEMBER.

### Why Project Service should reuse it
Create/discovery authorization without copying org membership tables.

### How it will integrate with Project Service
OpenFeign `OrganizationClient.memberPermissions` for `project.create` / `project.read`.

---

## Auth Service

### Purpose
Auth metadata APIs (`/api/auth/me`, status, logout); publishes `USER_AUTHENTICATED`.

### Where currently used
Port `8081`.

### Existing code location
`services/auth-service`.

### Why Project Service should reuse it
Indirectly — login path produces JWTs consumed by project APIs; no direct Feign required for CRUD.

### How it will integrate with Project Service
Same Keycloak issuer; optional future hooks for disablement events.

---

## Spring Data JPA + Hibernate

### Purpose
ORM persistence for PostgreSQL-backed domain aggregates.

### Where currently used
user, organization, auth (limited), project services.

### Existing code location
`spring-boot-starter-data-jpa`; entities under `com.devflow.project.entity`.

### Why Project Service should reuse it
Project aggregate graph (members, settings, tags, favorites, activity, outbox).

### How it will integrate with Project Service
Repositories + Specifications for list/search; `@Version` optimistic locking.

---

## PostgreSQL

### Purpose
System of record for relational domain data.

### Where currently used
Per-service databases (`devflow_auth`, `devflow_user`, `devflow_organization`, `devflow_project`, …).

### Existing code location
Docker Postgres + `infrastructure/database/postgres/init/00-create-databases.sh`.

### Why Project Service should reuse it
Strong constraints/indexes for org+key uniqueness, memberships, favorites; SQL search sufficient for Phase 4.

### How it will integrate with Project Service
Dedicated DB `devflow_project`; no cross-service FKs.

---

## Flyway

### Purpose
Versioned schema migrations.

### Where currently used
Each JPA service’s `src/main/resources/db/migration`.

### Existing code location
project-service `V1`–`V8` (foundation, projects, members, settings, tags, favorites, activity, outbox).

### Why Project Service should reuse it
Repeatable schema evolution; matches platform convention.

### How it will integrate with Project Service
Any future schema changes continue as `V9+` after inspecting current versions.

---

## Apache Kafka

### Purpose
Async domain events for audit/analytics/notification/future consumers.

### Where currently used
auth, user, organization, project producers; topic init scripts.

### Existing code location
`KafkaTopics.PROJECT_EVENTS = "project-events"`; `create-topics*.sh`; project outbox publisher.

### Why Project Service should reuse it
Decouple project lifecycle from consumers; at-least-once delivery.

### How it will integrate with Project Service
Write `outbox_events` in DB transaction → scheduled publish of `EventEnvelope` JSON.

---

## Transactional Outbox pattern

### Purpose
Avoid dual-write inconsistency between PostgreSQL and Kafka.

### Where currently used
**project-service** (primary production of this pattern in DevFlow).

### Existing code location
`OutboxEvent` entity, `OutboxService`, `OutboxPublisher`, migration `V8__create_outbox_events.sql`.

### Why Project Service should reuse it
Create/member/settings mutations must not lose events if Kafka is briefly down.

### How it will integrate with Project Service
Domain services call `ProjectEventPublisher` → outbox only (not `KafkaTemplate` directly).

---

## OpenFeign

### Purpose
Typed synchronous HTTP between microservices.

### Where currently used
user ↔ org; org ↔ user; project ↔ user/org.

### Existing code location
`spring-cloud-starter-openfeign`; `FeignClientConfig` Authorization relay.

### Why Project Service should reuse it
Existing standard; simpler than inventing gRPC/event projection for org create checks.

### How it will integrate with Project Service
`UserClient`, `OrganizationClient` with `devflow.clients.*-url` properties.

---

## Redis

### Purpose
Short-lived infrastructure state (gateway rate limiting).

### Where currently used
Gateway `RequestRateLimiter`; Redis starters on several services.

### Existing code location
Docker `redis`; `gateway-service` rate limiter config.

### Why Project Service should reuse it (selectively)
Not required for core project CRUD; optional later for Feign permission cache.

### How it will integrate with Project Service
Leave unused for Phase 4 domain logic unless caching org permissions.

---

## Bean Validation (Jakarta Validation)

### Purpose
Server-side request validation.

### Where currently used
All business services with DTOs.

### Existing code location
`spring-boot-starter-validation`; `@Valid` on controllers; `@NotBlank`/`@Pattern` on records.

### Why Project Service should reuse it
Validate key, color `#RRGGBB`, name lengths, page sizes independently of frontend Zod.

### How it will integrate with Project Service
Request DTOs already annotated; common handler maps to 400.

---

## OpenAPI / springdoc

### Purpose
Document REST APIs and Bearer security scheme.

### Where currently used
auth, user, organization, project Swagger UI.

### Existing code location
`OpenApiConfig` + `/swagger-ui.html` per service.

### Why Project Service should reuse it
Contract for frontend integration and QA.

### How it will integrate with Project Service
Annotate controllers; keep aligned with `project-api-contract.md`.

---

## Common Library

### Purpose
Shared API envelope, security helpers, events, exceptions, Kafka topic names.

### Where currently used
All backend modules.

### Existing code location
`backend/common-library` — `ApiResponse`, `PageResponse`, `EventEnvelope`, `KafkaTopics`, JWT converter, exceptions, correlation filter.

### Why Project Service should reuse it
Avoid second response/error formats.

### How it will integrate with Project Service
Maven dependency; auto-config for exception handler + correlation filter.

---

## Docker / Docker Compose

### Purpose
Local infrastructure and optional app containers.

### Where currently used
`infrastructure/docker/docker-compose.yml` — postgres, mongo, redis, kafka, keycloak; `apps` profile for auth/user/org/project/gateway.

### Existing code location
Compose service `project-service` profile `apps`, port `8084`.

### Why Project Service should reuse it
Reproducible multi-service local runs.

### How it will integrate with Project Service
Build after `mvn package`; depends on postgres/redis/kafka/keycloak/user/org.

---

## Maven (multi-module)

### Purpose
Build orchestration and BOM alignment.

### Where currently used
`backend/pom.xml` modules list includes `services/project-service`.

### Existing code location
Parent POM Spring Boot 3.3.x / Spring Cloud / Testcontainers BOM.

### Why Project Service should reuse it
Shared dependency versions and reactor builds.

### How it will integrate with Project Service
`mvn -pl services/project-service -am test|package`.

---

## JUnit 5 + Mockito + Spring Security Test

### Purpose
Unit and MVC security tests.

### Where currently used
Across services; project-service has service/authz/member/outbox/unauthorized tests.

### Existing code location
`src/test/java/com/devflow/project/...`

### Why Project Service should reuse it
Match platform testing style; JWT post-processors for 401/403.

### How it will integrate with Project Service
Extend coverage for settings/tags/favorites/activity and status/health when wired.

---

## Testcontainers

### Purpose
PostgreSQL integration tests without manual DB setup.

### Where currently used
Declared in parent BOM / service test deps (user/org/project modules prepared).

### Existing code location
Parent `testcontainers.version`; service `pom.xml` test dependencies.

### Why Project Service should reuse it
Validate Flyway + repositories against real Postgres.

### How it will integrate with Project Service
Optional `@SpringBootTest` + PostgreSQL container for migration/IT suites.

---

## Next.js 15 + TypeScript + TanStack Query (frontend)

### Purpose
Product UI for project management.

### Where currently used
`frontend/` — full Projects module under `features/projects` and App Router routes.

### Existing code location
Mock `project.service.ts`; hooks in `use-projects.ts`; Zod schemas; permission guards.

### Why Project Service should reuse it (as consumer)
UI already expresses product requirements; backend contract should serve these journeys after an adapter.

### How it will integrate with Project Service
Replace mock with Gateway HTTP; map enums/fields; do **not** change frontend in Prompt 5A.

---

## Technologies explicitly out of Project Service scope (discovered but deferred)

| Technology / domain | Why deferred |
|---|---|
| Elasticsearch | PostgreSQL ILIKE/search sufficient; repository layer can swap later |
| Task / Sprint / Document / Repository / Deployment modules | Separate frontend features & future services |
| MongoDB | Used elsewhere (documents); not project relational model |
| Custom password auth | Forbidden — Keycloak owns credentials |

---

## Summary

Project Service should **reuse** the existing DevFlow platform stack (Boot 3, Security/JWT/Keycloak, JPA/Postgres/Flyway, Feign, Kafka outbox, Gateway, common-library). Analysis shows these integrations are already largely present in `services/project-service`; remaining work is primarily **frontend contract adaptation**, optional dedicated status/health endpoints/events, and product decisions (duplicate, TEAM visibility).
