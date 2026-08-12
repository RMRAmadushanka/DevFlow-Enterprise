# Phase 4 Events — Index

Full project event contract (every event, outbox, idempotency, security):

→ **[phase-4-project-events.md](./phase-4-project-events.md)**

Technology write-up: [../technology-stack/phase-4/5D-events.md](../technology-stack/phase-4/5D-events.md)

---

## Quick reference

| Topic | Producer | Envelope |
|---|---|---|
| `project-events` | project-service transactional outbox | `EventEnvelope` (`common-library`) |

| Event types |
|---|
| `PROJECT_CREATED`, `PROJECT_UPDATED`, `PROJECT_STATUS_CHANGED`, `PROJECT_HEALTH_CHANGED` |
| `PROJECT_ARCHIVED`, `PROJECT_RESTORED`, `PROJECT_DELETED` |
| `PROJECT_OWNERSHIP_TRANSFERRED` |
| `PROJECT_MEMBER_ADDED`, `PROJECT_MEMBER_ROLE_CHANGED`, `PROJECT_MEMBER_REMOVED` |
| `PROJECT_SETTINGS_UPDATED` |
| `PROJECT_TAG_CREATED`, `PROJECT_TAG_UPDATED`, `PROJECT_TAG_DELETED` |
| `PROJECT_FAVORITED`, `PROJECT_UNFAVORITED` |

**Path:** domain → `ProjectEventPublisher` → `OutboxService` → `outbox_events` → `OutboxPublisher` → Kafka  
**Consumers:** none in Phase 4 (future audit/notification/search/task).  
**Secrets:** never in payloads.
