# Phase 4 Project Events — Contract

Kafka domain events for **project-service** (projects, members, settings, tags, favorites).

**Topic constant:** `KafkaTopics.PROJECT_EVENTS` → `project-events`  
**Envelope:** `common-library/.../event/EventEnvelope.java`  
**Producer path:** domain service → `ProjectEventPublisher` → `OutboxService` → `outbox_events` → `OutboxPublisher` → Kafka  

Related: [phase-3-events.md](./phase-3-events.md) (same envelope + at-least-once rules). Short index: [phase-4-events.md](./phase-4-events.md).

---

## Topic

| Topic | Constant | Producer | Partition key |
|---|---|---|---|
| `project-events` | `PROJECT_EVENTS` | project-service (outbox only) | `aggregateId` (project UUID) |

No second Kafka architecture. Domain services **must not** call `KafkaTemplate` directly.

---

## Envelope

```json
{
  "eventId": "…",
  "eventType": "PROJECT_CREATED",
  "aggregateType": "Project",
  "aggregateId": "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
  "timestamp": "2026-08-08T10:00:00Z",
  "source": "project-service",
  "version": 1,
  "correlationId": "…",
  "payload": { }
}
```

| Field | Source |
|---|---|
| `eventId` | New UUID at publish time |
| `correlationId` | Captured from `X-Correlation-Id` / MDC at **enqueue**; reused by outbox poller |
| `payload` | Domain map only — never passwords, JWTs, refresh tokens, secrets, or Authorization headers |

---

## Delivery, retries, idempotency

| Rule | Detail |
|---|---|
| Semantics | **At-least-once** (retry may re-publish before status flip) |
| Outbox atomicity | Domain write + `outbox_events` insert in one DB transaction |
| Poll | `OutboxPublisher` every `devflow.outbox.poll-interval-ms` (default 2000), batch `devflow.outbox.batch-size` (default 50) |
| Retry | On failure: `retry_count++`, `last_error` set; row stays `PENDING` until `retry_count >= 10` → `FAILED` |
| Dead-letter | No separate DLQ topic in Phase 4; `FAILED` rows are the operational sink (ops can requeue manually) |
| Consumer duty | Dedup by `eventId`; upsert by natural keys (`projectId`, `(projectId,userId)`, `(projectId,name)` for tags) |
| Duplicate messages | Expected; consumers must be idempotent |
| Phase 4 consumers | **None implemented** — future audit/notification/search/task |

---

## Integrations (sync)

| Peer | Pattern | Purpose |
|---|---|---|
| user-service | Feign `UserClient` | Resolve JWT `sub` → user; verify member user exists |
| organization-service | Feign `OrganizationClient` | `project.create` / org discovery permissions — **no duplicated membership tables** |
| API Gateway | Route `/api/projects/**` → `:8084`; `X-Correlation-Id` filter | Edge entry + correlation |

Feign relays `Authorization` + `X-Correlation-Id` (`FeignClientConfig`).

---

## Activity vs Kafka

| Store | Purpose |
|---|---|
| `project_activity` | In-service UI feed (synchronous) |
| `project-events` | Cross-service integration (outbox → Kafka) |

Activity type strings typically match event type names. Activity is **not** a substitute for outbox publishing.

---

## Events

All events: **Producer** `project-service`, **Topic** `project-events`, **Aggregate** `Project`, **Retry** outbox (10), **Idempotency** consumer `eventId` + natural key, **Security** no secrets in payload.

### PROJECT_CREATED

| | |
|---|---|
| **Trigger** | `POST /api/projects` |
| **Payload** | `projectId`, `organizationId`, `name`, `slug`, `projectKey`, `actorUserId` |
| **Consumers** | Future: audit, search, notification |
| **Activity** | Yes |

### PROJECT_UPDATED

| | |
|---|---|
| **Trigger** | `PATCH /api/projects/{id}` |
| **Payload** | `projectId`, `actorUserId` |
| **Consumers** | Future: search, audit |
| **Activity** | Yes |

### PROJECT_STATUS_CHANGED

| | |
|---|---|
| **Trigger** | `PATCH /api/projects/{id}/status` |
| **Payload** | `projectId`, `actorUserId`, `previousStatus`, `status` |
| **Consumers** | Future: notification, analytics |
| **Activity** | Yes |

### PROJECT_HEALTH_CHANGED

| | |
|---|---|
| **Trigger** | `PATCH /api/projects/{id}/health` |
| **Payload** | `projectId`, `actorUserId`, `previousHealth`, `health` |
| **Consumers** | Future: notification, analytics |
| **Activity** | Yes |

### PROJECT_ARCHIVED

| | |
|---|---|
| **Trigger** | `POST /api/projects/{id}/archive` |
| **Payload** | `projectId`, `actorUserId` |
| **Consumers** | Future: notification, search |
| **Activity** | Yes |

### PROJECT_RESTORED

| | |
|---|---|
| **Trigger** | `POST /api/projects/{id}/restore` |
| **Payload** | `projectId`, `actorUserId` |
| **Consumers** | Future: search |
| **Activity** | Yes |

### PROJECT_DELETED

| | |
|---|---|
| **Trigger** | `DELETE /api/projects/{id}` (soft archive) |
| **Payload** | `projectId`, `actorUserId` |
| **Note** | Same DB effect as archive; distinct event for delete intent |
| **Consumers** | Future: cleanup policies |
| **Activity** | Yes |

### PROJECT_OWNERSHIP_TRANSFERRED

| | |
|---|---|
| **Trigger** | `POST /api/projects/{id}/ownership/transfer` |
| **Payload** | `projectId`, `previousOwnerUserId`, `newOwnerUserId`, `actorUserId` |
| **Consumers** | Future: audit, notification |
| **Activity** | Yes |

### PROJECT_MEMBER_ADDED

| | |
|---|---|
| **Trigger** | `POST /api/projects/{id}/members` |
| **Payload** | `projectId`, `userId`, `role`, `actorUserId` |
| **Consumers** | Future: notification |
| **Activity** | Yes |

### PROJECT_MEMBER_ROLE_CHANGED

| | |
|---|---|
| **Trigger** | `PATCH /api/projects/{id}/members/{userId}` |
| **Payload** | `projectId`, `userId`, `role`, `status`, `actorUserId` |
| **Consumers** | Future: audit |
| **Activity** | Yes |

### PROJECT_MEMBER_REMOVED

| | |
|---|---|
| **Trigger** | `DELETE /api/projects/{id}/members/{userId}` (soft `REMOVED`) |
| **Payload** | `projectId`, `userId`, `actorUserId` |
| **Consumers** | Future: notification |
| **Activity** | Yes |

### PROJECT_SETTINGS_UPDATED

| | |
|---|---|
| **Trigger** | `PATCH /api/projects/{id}/settings` |
| **Payload** | `projectId`, `actorUserId` |
| **Consumers** | Future: audit |
| **Activity** | Yes |

### PROJECT_TAG_CREATED

| | |
|---|---|
| **Trigger** | `POST /api/projects/{id}/tags` |
| **Payload** | `projectId`, `tagId`, `name`, `actorUserId` |
| **Consumers** | Future: search |
| **Activity** | Yes |

### PROJECT_TAG_UPDATED

| | |
|---|---|
| **Trigger** | `PATCH /api/projects/{id}/tags/{tagId}` |
| **Payload** | `projectId`, `tagId`, `actorUserId` |
| **Consumers** | Future: search |
| **Activity** | Yes |

### PROJECT_TAG_DELETED

| | |
|---|---|
| **Trigger** | `DELETE /api/projects/{id}/tags/{tagId}` |
| **Payload** | `projectId`, `tagId`, `actorUserId` |
| **Consumers** | Future: search |
| **Activity** | Yes |

### PROJECT_FAVORITED

| | |
|---|---|
| **Trigger** | `POST /api/projects/{id}/favorite` |
| **Payload** | `projectId`, `actorUserId` |
| **Consumers** | Future: personalization |
| **Activity** | Yes |

### PROJECT_UNFAVORITED

| | |
|---|---|
| **Trigger** | `DELETE /api/projects/{id}/favorite` |
| **Payload** | `projectId`, `actorUserId` |
| **Consumers** | Future: personalization |
| **Activity** | Yes |

---

## Outbox schema (`outbox_events`)

| Column | Purpose |
|---|---|
| `id` | UUID PK |
| `aggregate_type` | Always `Project` |
| `aggregate_id` | Project UUID string |
| `event_type` | `ProjectEventType` name |
| `payload` | JSONB domain map |
| `status` | `PENDING` / `PUBLISHED` / `FAILED` |
| `retry_count` | Publish attempts |
| `correlation_id` | Request correlation at enqueue |
| `last_error` | Last publish/serialize error (truncated) |
| `created_at` | Enqueue time |
| `published_at` | Success time |

Flyway: `V8__create_outbox_events.sql`, `V10__outbox_correlation_and_last_error.sql`.
