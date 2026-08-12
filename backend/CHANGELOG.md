# Changelog

All notable changes to the DevFlow backend are documented in this file.

---

## [Phase 4] — Project Management

**Status: Completed** (implementation + unit/WebMvc tests verified; Docker/Testcontainers/live stack not available in final audit environment)

### Features

- Project CRUD under `/api/projects` with immutable `project_key` (JSON create property `"key"`, 2–10 uppercase A-Z0-9)
- Soft archive via `POST .../archive` and `DELETE` (DELETE emits `PROJECT_DELETED`); restore via `POST .../restore`
- Dedicated `PATCH .../status` and `PATCH .../health` (events `PROJECT_STATUS_CHANGED` / `PROJECT_HEALTH_CHANGED`; invalid transitions → 422)
- Project summary, ownership transfer, members, settings (1:1), tags, favorites, activity feed
- Visibility `PRIVATE` / `ORGANIZATION` / `TEAM` (`TEAM` = members-only in Phase 4)
- Project RBAC roles (`PROJECT_OWNER` … `PROJECT_GUEST`) with `project.*` permission matrix
- Org Feign checks for `project.create` and ORGANIZATION discovery (`project.read` / `organization.read`)
- Optimistic locking via `@Version` on projects and settings

### APIs

- Gateway-routed `/api/projects/**` (and legacy `/api/v1/project/**`)
- OpenAPI bearer JWT scheme + `@SecurityRequirement` on project controllers
- Bean Validation; consistent `400` / `401` / `403` / `404` / `409` / `422` / `500`

### Database

- Flyway `V1`–`V10` in project-service (`devflow_project`)
- Soft delete: `status=ARCHIVED` + `archived_at`; members soft-removed as `REMOVED`
- Unique keys: `(organization_id, project_key)`, `(organization_id, slug)`, membership/favorite/tag pairs
- Query indexes (V9); outbox `correlation_id` + `last_error` (V10)
- List summary uses batched member counts (no per-row N+1 count)

### Kafka

- Produce: `project-events` via transactional outbox + scheduled `OutboxPublisher`
- Event types: `PROJECT_CREATED`, `PROJECT_UPDATED`, `PROJECT_STATUS_CHANGED`, `PROJECT_HEALTH_CHANGED`, `PROJECT_ARCHIVED`, `PROJECT_RESTORED`, `PROJECT_DELETED`, `PROJECT_OWNERSHIP_TRANSFERRED`, `PROJECT_MEMBER_*`, `PROJECT_SETTINGS_UPDATED`, `PROJECT_TAG_*`, `PROJECT_FAVORITED` / `PROJECT_UNFAVORITED`
- Domain services do not call `KafkaTemplate` directly

### Security

- Bearer JWT (OAuth2 Resource Server + Keycloak); no second auth mechanism
- `ProjectAuthorizationService` (`canReadProject`, `canUpdateProject`, …)
- Actor from JWT `sub` → user-service; never trust client role/userId
- Feign relays `Authorization` + `X-Correlation-Id`

### Tests

- JUnit 5 + Mockito: domain, RBAC matrix, services, outbox publish/retry/fail, WebMvc 401/auth
- Last-owner protection covers soft-remove via status=`REMOVED`
- `ProjectRepositoryIT` (Testcontainers PostgreSQL) — skips when Docker unavailable
- Frontend enum mapper unit tests (`project-api.mappers.test.ts`)

### Documentation

- `api/project-api-contract.md`
- `frontend/project-feature-api-mapping.md`
- `database/phase-4-project-database.md`
- `events/phase-4-project-events.md`
- `architecture/project-service-architecture.md`
- `architecture/phase-4-final-audit.md`
- `domain/project-domain.md`
- `technology-stack/phase-4/5A`–`5E` + `phase-4-final.md`

### Infrastructure

- Docker Compose `project-service` (profile `apps`) with postgres/redis/kafka/keycloak/user/org deps
- Gateway `PROJECT_SERVICE_URL`; Kafka topic `project-events` in init scripts
- `.env.example` Phase 4 notes; `application-local.yml` / `application-docker.yml`

### Frontend integration

- Optional live API: `NEXT_PUBLIC_USE_PROJECT_API=true` → `project-api.service.ts` + mappers
- Default remains in-memory mock (no UI redesign)
- `apiClient` parses DevFlow `{ error: { code, message } }` envelope

### Audit fixes (5F)

- Last-owner invariant for `REMOVED` status transitions
- Ownership transfer verifies user; event previous-owner fields corrected
- Outbox `FOR UPDATE SKIP LOCKED` claim
- Favorites list batched summaries
- OpenAPI public gated (`openapi-public`, false in docker)
- Optimistic lock / data integrity → HTTP 409
- Contract/docs: response JSON field `"key"`

### Known limitations

- No project duplicate/clone API (client may create-with-copy)
- `TEAM` visibility not yet scoped to organization teams
- No Kafka consumers for `project-events` yet
- Detail widgets (analytics, repo, environments, tasks) out of Phase 4 — empty/minimal in API mode
- Transfer UI `memberId` vs backend `newOwnerUserId` needs careful wiring when members API is used
- Auth `getClientSession()` still stubbed — live frontend API needs token wiring
- Org permission Feign results not cached in Redis
- Settings flags `allowGuestAccess` / `allowMemberInvites` persisted but not enforced

---

## [Phase 3] — User & Organization Domain

### Features

- Application user profiles upserted from Keycloak JWT `sub` (`externalIdentityId`); email never used as PK
- User profile and preference APIs under `/api/users`
- Organization CRUD with soft archive (`ARCHIVED`) under `/api/organizations`
- Teams under `/api/organizations/{orgId}/teams` and `/api/teams/{teamId}`
- Organization memberships with seeded RBAC roles (`OWNER`, `ADMIN`, `MEMBER`, `GUEST`)
- Team memberships with roles `TEAM_ADMIN` | `TEAM_MEMBER` | `TEAM_VIEWER`
- Invitations with raw token returned once; SHA-256 `token_hash` stored; accept by token path
- Org-scoped permission checks (`organization.*`, `team.*`) plus platform Keycloak admin bypass

### Services

- `services/user-service` (port `8082`, DB `devflow_user`)
- `services/organization-service` (port `8083`, DB `devflow_organization`)
- Feign: org → user; user → org (for my-orgs)
- Gateway routes for users, organizations, teams, invitations

### Database

- Flyway migrations for users, preferences, orgs, teams, memberships, invitations, RBAC seed
- Soft archive for organizations; invitation lifecycle statuses

### Kafka

- Topics: `user-events`, `organization-events`, `membership-events`, `team-events`, `invitation-events`
- Consume: `user-authentication-events` → user upsert
- Shared `EventEnvelope` in common-library

### Security

- Bearer JWT on business APIs; actor resolve via `sub`
- OrganizationAuthorizationService permission checks

### Known limitations

- Cross-service UUID references without physical FKs
- Invitation email delivery is out of band / future notification-service

---

## [Phase 2] — Authentication Foundation

- Keycloak realm, PKCE web client, auth-service token helpers
- Gateway JWT validation and correlation id filter

---

## [Phase 1] — Backend Foundation

- Multi-module Maven, common-library, Docker infra (Postgres, Redis, Kafka, Keycloak)
)
