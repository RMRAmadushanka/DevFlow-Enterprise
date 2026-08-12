# Phase 4 / 5D — Events & Microservice Integration

How **project-service** integrates with Kafka, user-service, organization-service, and the API Gateway using the **existing** DevFlow event architecture (no second Kafka stack).

Event catalog: [../../events/phase-4-project-events.md](../../events/phase-4-project-events.md)

---

## Apache Kafka

| | |
|---|---|
| **Purpose** | Durable async pub/sub for cross-service project domain facts |
| **Why used** | Decouple project lifecycle from future audit/notification/search/task consumers; match Phase 3 topic model |
| **Where integrated** | Topic `project-events` (`KafkaTopics.PROJECT_EVENTS`); `KafkaConfig` declares topic; only `OutboxPublisher` produces |
| **Code-level** | `spring-kafka` + `KafkaTemplate<String, String>`; message value = JSON `EventEnvelope`; key = project aggregate id |
| **Data flow** | HTTP mutation → DB domain + outbox → poller → Kafka → (future) consumers |
| **Failure handling** | Broker errors stay in outbox (`PENDING` → retry → `FAILED`); request path returns success after DB commit |
| **Testing** | Unit tests mock `KafkaTemplate` (`OutboxPublisherTest`); no external broker required for unit suite |
| **Scaling** | 3 partitions (local); scale consumers by group; increase partitions with load |

---

## Transactional Outbox

| | |
|---|---|
| **Purpose** | Atomically record “event intent” with domain changes; publish after commit |
| **Why used** | Avoid dual-write inconsistency (DB committed but Kafka miss, or Kafka without DB) |
| **Where integrated** | Table `outbox_events`; `OutboxService.enqueue` in same `@Transactional` as domain services |
| **Code-level** | Entity `OutboxEvent`; statuses `PENDING`/`PUBLISHED`/`FAILED`; columns include `correlation_id`, `last_error`, `retry_count` |
| **Data flow** | Service mutation → `ProjectEventPublisher.publish` → insert PENDING → commit → `OutboxPublisher` → Kafka → PUBLISHED |
| **Failure handling** | Publish fail: increment retry, store `last_error`; after 10 → `FAILED` (ops sink; no DLQ topic in Phase 4) |
| **Testing** | `OutboxServiceTest` (enqueue + correlation); `OutboxPublisherTest` (success/retry/fail/serialization) |
| **Scaling** | Batch poll (`batch-size`); index `(status, created_at)`; horizontal pollers need row locking if multi-instance (future) |

---

## Spring Kafka

| | |
|---|---|
| **Purpose** | Spring abstraction over producer API |
| **Why used** | Consistent with user/org services; typed templates; Boot auto-config |
| **Where integrated** | `OutboxPublisher` only; domain code never injects `KafkaTemplate` |
| **Code-level** | `kafkaTemplate.send(topic, key, json).get()` for sync ack inside poller transaction |
| **Data flow** | Poller thread → serialize envelope → send → mark published |
| **Failure handling** | Exceptions → outbox retry path; serialization failures also retry then FAILED |
| **Testing** | Mock template returning completed/failed `CompletableFuture` |
| **Scaling** | Producer batching via Spring/Kafka producer configs as traffic grows |

---

## Event-driven architecture

| | |
|---|---|
| **Purpose** | Publish project facts for eventual consistency across microservices |
| **Why used** | Project ownership stays in project-service; peers react asynchronously |
| **Where integrated** | All Phase 4 mutations that change project domain state emit `ProjectEventType` |
| **Code-level** | Enum `ProjectEventType`; publisher facade; shared `EventEnvelope` from common-library |
| **Data flow** | See diagram below |
| **Failure handling** | At-least-once; consumers must be idempotent (`eventId` + natural keys) |
| **Testing** | Domain service tests verify `eventPublisher.publish(...)`; outbox tests verify Kafka JSON |
| **Scaling** | New consumers join consumer groups; no change to producer contract |

```
Client → Gateway (X-Correlation-Id)
      → project-service (JWT)
      → domain TX: projects* + outbox_events
      → OutboxPublisher → project-events (Kafka)
      ↘ Feign → user-service / organization-service (sync authz/identity)
```

---

## Correlation IDs

| | |
|---|---|
| **Purpose** | Trace a request across gateway, Feign, logs, and Kafka events |
| **Why used** | Ops/debug for distributed flows; required in envelope |
| **Where integrated** | Gateway `CorrelationIdGatewayFilter`; common `CorrelationIdFilter` + `CorrelationIdHolder`; Feign relay; outbox `correlation_id` |
| **Code-level** | Enqueue stores holder value; `EventEnvelope.of(..., correlationId)` preserves it on async publish |
| **Data flow** | Header in → MDC/holder → outbox column → Kafka `correlationId` → logs `[corr=…]` |
| **Failure handling** | If missing at publish, envelope generates a UUID (never null) |
| **Testing** | `OutboxServiceTest` / `EventEnvelopeTest` / publisher JSON assertion |
| **Scaling** | Stateless; no shared store required |

---

## User Service integration

| | |
|---|---|
| **Purpose** | Resolve actor identity; verify users for membership |
| **Why used** | Single source of truth for application users (Phase 3) |
| **Where integrated** | `UserClient` Feign (`by-external-id`, `me`, `getById`); `CurrentUserResolver`; member add path |
| **Pattern** | Same OpenFeign style as organization-service → user-service — **no second HTTP client stack** |

---

## Organization Service integration

| | |
|---|---|
| **Purpose** | Organization-level authorization for create / ORGANIZATION visibility |
| **Why used** | Avoid duplicating org membership/RBAC into project DB |
| **Where integrated** | `OrganizationClient.memberPermissions`; `ProjectAuthorizationService` |
| **Pattern** | Sync Feign permission check only |

---

## API Gateway

| | |
|---|---|
| **Purpose** | Single edge for `/api/projects/**` → project-service `:8084` |
| **Why used** | Consistent routing/CORS/correlation with other services |
| **Where integrated** | `gateway-service` route `project-service`; correlation filter |

---

## Verification

```bash
cd backend
.tools/apache-maven-3.9.6/bin/mvn.cmd -pl services/project-service -am test
```

Confirm: create/update/member/status paths call `ProjectEventPublisher`; outbox enqueue stores correlation; publisher tests pass without a live Kafka broker.
