# Phase 3 Events — User & Organization

Kafka domain events for user profiles, organizations, teams, memberships, and invitations.

**Constants:** `common-library/.../constant/KafkaTopics.java`  
**Envelope (Phase 3+):** `common-library/.../event/EventEnvelope.java`

---

## Delivery & idempotency

| Rule | Detail |
|---|---|
| Semantics | **At-least-once** delivery |
| Consumer duty | Duplicate-safe processing |
| User upserts | Idempotent by `externalIdentityId` (unique) |
| Memberships | Unique `(organizationId, userId)` / `(teamId, userId)` — treat re-delivery as upsert/no-op |
| Invitations | Accept transitions `PENDING` → `ACCEPTED` once; re-accept is conflict/no-op |
| Secrets | Never publish passwords, JWTs, refresh tokens, or raw invitation tokens |

---

## Topics

| Topic | Constant | Primary producer |
|---|---|---|
| `user-authentication-events` | `USER_AUTHENTICATION_EVENTS` | auth-service |
| `user-events` | `USER_EVENTS` | user-service |
| `organization-events` | `ORGANIZATION_EVENTS` | organization-service |
| `membership-events` | `MEMBERSHIP_EVENTS` | organization-service |
| `team-events` | `TEAM_EVENTS` | organization-service |
| `invitation-events` | `INVITATION_EVENTS` | organization-service |

Routing note: membership-related `ORGANIZATION_MEMBER_*` / `ORGANIZATION_ROLE_CHANGED` events are published to **`membership-events`**, not `organization-events`.

---

## Envelope shape (user / organization domain)

```json
{
  "eventId": "…",
  "eventType": "ORGANIZATION_CREATED",
  "aggregateType": "Organization",
  "aggregateId": "…",
  "timestamp": "2026-08-08T10:00:00Z",
  "source": "organization-service",
  "version": 1,
  "correlationId": "…",
  "payload": { }
}
```

Auth authentication events use a flatter JSON shape (Phase 2) without `EventEnvelope`.

---

## Consuming authentication events (user-service)

| | |
|---|---|
| **Event** | `USER_AUTHENTICATED` |
| **Producer** | auth-service |
| **Topic** | `user-authentication-events` |
| **Consumer** | user-service `UserAuthenticatedListener` (group `user-service`) |
| **Purpose** | Ensure local user row exists after login |
| **Payload fields** | `eventId`, `eventType`, `userId` (Keycloak sub), `timestamp`, `source`, `correlationId`, `metadata.{email,username,firstName,lastName}` |
| **Idempotency** | Upsert by `externalIdentityId = userId` |

---

## User events (`user-events`)

Producer: `services/user-service/.../events/UserEventPublisher.java`  
Aggregate type: `User`

### USER_CREATED

| | |
|---|---|
| **Producer** | user-service |
| **Topic** | `user-events` |
| **Payload** | `userId`, `externalIdentityId`, `username`, `email`, `status` |
| **Consumers** | Future: audit, notification, search |
| **Purpose** | Announce first local profile creation |
| **Idempotency** | Upsert by `externalIdentityId` |

### USER_UPDATED

| | |
|---|---|
| **Producer** | user-service |
| **Topic** | `user-events` |
| **Payload** | Same core user fields |
| **Consumers** | Future: audit, search |
| **Purpose** | Profile sync from JWT or PATCH |
| **Idempotency** | Upsert / last-write by `userId` |

### USER_DEACTIVATED

| | |
|---|---|
| **Producer** | user-service |
| **Topic** | `user-events` |
| **Payload** | Core user fields with deactivated status |
| **Consumers** | Future: audit, org membership cleanup policies |
| **Purpose** | Soft deactivation signal |
| **Idempotency** | Status set is duplicate-safe |

### USER_PREFERENCES_UPDATED

| | |
|---|---|
| **Producer** | user-service |
| **Topic** | `user-events` |
| **Payload** | Core fields + `theme`, `notifyEmail`, `notifyInApp` |
| **Consumers** | Future: notification-service |
| **Purpose** | Preference change fan-out |
| **Idempotency** | Upsert preferences by `userId` |

---

## Organization events (`organization-events`)

Producer: `OrganizationEventPublisher.publishOrganization` (non-membership types)

### ORGANIZATION_CREATED

| | |
|---|---|
| **Producer** | organization-service |
| **Topic** | `organization-events` |
| **Payload** | `organizationId`, `name`, `slug`, `createdBy` |
| **Consumers** | Future: audit, analytics, notification |
| **Purpose** | New tenant org |
| **Idempotency** | Upsert org by `organizationId` / unique `slug` |

### ORGANIZATION_UPDATED

| | |
|---|---|
| **Producer** | organization-service |
| **Topic** | `organization-events` |
| **Payload** | `organizationId`, `updatedBy` (+ changed fields as published) |
| **Consumers** | Future: audit, search |
| **Purpose** | Org metadata change |
| **Idempotency** | Upsert by `organizationId` |

### ORGANIZATION_ARCHIVED

| | |
|---|---|
| **Producer** | organization-service |
| **Topic** | `organization-events` |
| **Payload** | `organizationId`, `archivedBy` |
| **Consumers** | Future: cascade soft-archive in domain services, audit |
| **Purpose** | Soft delete signal |
| **Idempotency** | Status `ARCHIVED` is duplicate-safe |

---

## Membership events (`membership-events`)

Same publisher; membership event types route here.

### ORGANIZATION_MEMBER_ADDED

| | |
|---|---|
| **Producer** | organization-service |
| **Topic** | `membership-events` |
| **Payload** | `organizationId`, `userId`, `roleCode`, plus `addedBy` / `source` depending on path |
| **Consumers** | Future: audit, analytics, notification |
| **Purpose** | Direct add, org create OWNER, or invitation accept |
| **Idempotency** | Unique `(organizationId, userId)` upsert / ignore conflict |

### ORGANIZATION_MEMBER_REMOVED

| | |
|---|---|
| **Producer** | organization-service |
| **Topic** | `membership-events` |
| **Payload** | `organizationId`, `userId`, `removedBy` |
| **Consumers** | Future: task unassign, project access, audit |
| **Purpose** | Membership hard remove |
| **Idempotency** | Delete-if-exists by unique membership key |

### ORGANIZATION_ROLE_CHANGED

| | |
|---|---|
| **Producer** | organization-service |
| **Topic** | `membership-events` |
| **Payload** | `organizationId`, `userId`, `roleCode`, `changedBy` |
| **Consumers** | Future: authz cache invalidation, audit, notification |
| **Purpose** | Role / status change on membership |
| **Idempotency** | Upsert role by membership key |

---

## Team events (`team-events`)

### TEAM_CREATED

| | |
|---|---|
| **Producer** | organization-service |
| **Topic** | `team-events` |
| **Payload** | `teamId`, `organizationId`, `name`, `slug`, … |
| **Consumers** | Future: audit |
| **Purpose** | Team created under org |
| **Idempotency** | Upsert by `teamId` / `(organizationId, slug)` |

### TEAM_UPDATED

| | |
|---|---|
| **Producer** | organization-service |
| **Topic** | `team-events` |
| **Payload** | `teamId`, `organizationId`, …; team delete publishes with `deleted: true` |
| **Consumers** | Future: audit |
| **Purpose** | Metadata update or delete signal |
| **Idempotency** | Upsert / delete-if-exists by `teamId` |

### TEAM_MEMBER_ADDED

| | |
|---|---|
| **Producer** | organization-service |
| **Topic** | `team-events` |
| **Payload** | `teamId`, `organizationId`, `userId`, `role` |
| **Consumers** | Future: audit, notification |
| **Purpose** | Team roster add |
| **Idempotency** | Unique `(teamId, userId)` |

### TEAM_MEMBER_REMOVED

| | |
|---|---|
| **Producer** | organization-service |
| **Topic** | `team-events` |
| **Payload** | `teamId`, `organizationId`, `userId` |
| **Consumers** | Future: audit |
| **Purpose** | Team roster remove |
| **Idempotency** | Delete-if-exists by unique key |

---

## Invitation events (`invitation-events`)

### INVITATION_CREATED

| | |
|---|---|
| **Producer** | organization-service |
| **Topic** | `invitation-events` |
| **Payload** | `invitationId`, `organizationId`, `email`, `roleCode`, … (**no token**) |
| **Consumers** | Future: notification-service (email), audit |
| **Purpose** | Invite issued |
| **Idempotency** | Upsert by `invitationId` |

### INVITATION_ACCEPTED

| | |
|---|---|
| **Producer** | organization-service |
| **Topic** | `invitation-events` |
| **Payload** | `invitationId`, `organizationId`, `userId`, `email`, `roleCode`, … |
| **Consumers** | Future: audit, analytics |
| **Purpose** | Invite converted to membership |
| **Idempotency** | Status transition to `ACCEPTED` once; pair with membership unique key |

### INVITATION_REVOKED

| | |
|---|---|
| **Producer** | organization-service |
| **Topic** | `invitation-events` |
| **Payload** | `invitationId`, `organizationId`, … |
| **Consumers** | Future: audit, notification |
| **Purpose** | Invite cancelled |
| **Idempotency** | Status `REVOKED` is duplicate-safe |

---

## Phase 3 consumer inventory

| Consumer | Topic | Status |
|---|---|---|
| user-service | `user-authentication-events` | **Implemented** |
| Others | `user-events`, `organization-events`, `membership-events`, `team-events`, `invitation-events` | Produced; consumers deferred (audit/notification/analytics) |
