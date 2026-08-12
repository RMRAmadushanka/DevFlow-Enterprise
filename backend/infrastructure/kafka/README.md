# Kafka (KRaft mode)

Phase 1 runs Apache Kafka in **KRaft** mode (no ZooKeeper).

## Topics

| Topic | Purpose | Producer | Future consumers |
|---|---|---|---|
| `user-authentication-events` | Auth lifecycle (`USER_AUTHENTICATED`, `USER_LOGOUT`, …) | auth-service | user-service, audit-service, analytics-service, notification-service |
| `user-events` | User lifecycle (`USER_CREATED`, …) | user-service | audit, notification, analytics |
| `organization-events` | Organization lifecycle + membership role changes | organization-service | audit, analytics, notification |
| `team-events` | Team lifecycle | organization-service | audit, analytics |
| `membership-events` | Membership add/remove (optional dedicated stream) | organization-service | audit, notification |
| `invitation-events` | Invitation lifecycle | organization-service | notification, audit |
| `project-events` | Project lifecycle (outbox → Kafka) | project-service | task, analytics, audit, notification |
| `task-events` | Task lifecycle | task-service | notification, analytics, audit |
| `notification-events` | Notification fan-out | various | notification-service |
| `audit-events` | Audit sink | various | audit-service |

Topics are created by:

1. `create-topics.sh` / `create-topics-bitnami.sh` (docker compose `kafka-init` service)
2. Idempotent `NewTopic` beans in Spring services

Delivery semantics: **at-least-once**. Consumers must be idempotent (see `documentation/events/phase-3-events.md`).

## Local bootstrap

```bash
docker compose -f infrastructure/docker/docker-compose.yml up -d kafka kafka-init
```
