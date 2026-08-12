# MongoDB Collections Strategy

MongoDB is used for document-like / high-write append workloads.

| Service | Database | Planned collections (later phases) |
|---|---|---|
| document-service | `devflow_document` | `documents`, `document_versions`, `document_comments` |
| notification-service | `devflow_notification` | `notification_outbox`, `in_app_notifications` |
| audit-service | `devflow_audit` | `audit_logs` (append-only, TTL optional) |

## Conventions

- `_id`: ObjectId or UUID string
- Always store `organizationId`, `createdAt`
- Prefer immutable append for audit
- Postgres remains system of record for relational domains (orgs, projects, tasks, sprints)
