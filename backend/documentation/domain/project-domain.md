# Project Domain Model — Phase 4

Canonical domain concepts for **project-service**.

---

## Aggregates

### Project

Root aggregate for a delivery workspace inside an organization.

| Field | Notes |
|---|---|
| `id` | UUID |
| `organizationId` | Logical FK to organization-service (no cross-DB FK) |
| `name`, `slug` | Display name; slug unique per org, set at create |
| `projectKey` | Immutable short key `^[A-Z0-9]{2,10}$`, unique per org |
| `status` | `PLANNING`, `ACTIVE`, `ON_HOLD`, `COMPLETED`, `ARCHIVED` |
| `health` | `HEALTHY`, `AT_RISK`, `CRITICAL`, `UNKNOWN` |
| `visibility` | `PRIVATE`, `ORGANIZATION`, `TEAM` (TEAM = members-only in Phase 4) |
| `createdBy` | Application user UUID (from JWT → user-service) |
| `archivedAt` | Set when soft-archived |
| `version` | Optimistic lock |

**Lifecycle rules** (`ProjectDomainRules`):

- Cannot create as `ARCHIVED`
- Cannot PATCH status to `ARCHIVED` (use archive/delete)
- Cannot mutate metadata while `ARCHIVED` (restore first)
- Archive/restore are explicit transitions

### ProjectMember

Membership of an application user on a project.

| Field | Notes |
|---|---|
| `role` | `PROJECT_OWNER` … `PROJECT_GUEST` |
| `status` | `ACTIVE`, `INACTIVE`, `REMOVED` (soft remove) |
| Unique | `(projectId, userId)` |

**Invariants:** at least one active `PROJECT_OWNER`; ownership transfer demotes previous owner to `PROJECT_ADMIN`.

### ProjectSettings

1:1 settings (timezone, default view, invite flags, default visibility). Versioned.

### ProjectTag

Named labels per project (`name` unique ignore-case; optional `#RRGGBB` color).

### ProjectFavorite

Per-user star: unique `(projectId, userId)`.

### ProjectActivity

Append-only UI feed (`activityType`, description, metadata JSON). Complements Kafka; not a substitute for outbox events.

### OutboxEvent

Transactional outbox row for Kafka publish intent (`PENDING` → `PUBLISHED` / `FAILED`).

---

## Permissions (project.*)

Derived from membership role inside `ProjectAuthorizationService` (never from client-supplied role). Org-level `project.create` / discovery via organization-service Feign.

See [project-service-architecture.md](../architecture/project-service-architecture.md) for the RBAC matrix.

---

## Events

Domain mutations emit `ProjectEventType` via outbox → `project-events`. Catalog: [phase-4-project-events.md](../events/phase-4-project-events.md).

---

## Frontend mapping notes

UI enums differ (`paused` ↔ `ON_HOLD`, `internal` ↔ `ORGANIZATION`). Mappers live in `frontend/.../project-api.mappers.ts` when `NEXT_PUBLIC_USE_PROJECT_API=true`.
