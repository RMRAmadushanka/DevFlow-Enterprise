# Invitation API Contract — Phase 3

Organization invitation APIs owned by **organization-service** (`services/organization-service`).

**Gateway:** `http://localhost:8080`  
**Paths:**

- Create/list: `/api/organizations/{organizationId}/invitations`
- Revoke/accept: `/api/invitations/{invitationId|token}`

**Authentication:** `Authorization: Bearer {access_token}` on all endpoints.

---

## Token security (critical)

| Rule | Detail |
|---|---|
| Generate | 32 random bytes → hex string (raw token) |
| Persist | **SHA-256 hex** in `invitations.token_hash` only |
| API return | Raw `token` returned **once** on create; omitted (`null`) on list/get |
| Accept | Client sends raw token in path; server hashes and looks up `token_hash` |
| Kafka | Payloads never include raw tokens |
| Logs | Never log raw tokens |

---

## Response envelope

Same `ApiResponse` / `PageResponse` as [user-api-contract.md](./user-api-contract.md).

**`InvitationResponse`:** `id`, `organizationId`, `email`, `roleCode`, `status`, `expiresAt`, `invitedBy`, `createdAt`, `acceptedAt`, `token` (non-null only on create)

Statuses: `PENDING` | `ACCEPTED` | `EXPIRED` | `REVOKED`

---

## Endpoints

### POST `/api/organizations/{organizationId}/invitations`

| | |
|---|---|
| **Authentication** | Bearer JWT |
| **Authorization** | `organization.manage_members` |
| **Request** | `CreateInvitationRequest` |
| **Response** | `201` + `ApiResponse<InvitationResponse>` including **raw `token` once** |
| **Side effect** | `INVITATION_CREATED` on `invitation-events` (no token in payload) |

**Request**

```json
{
  "email": "new.dev@example.com",
  "roleCode": "MEMBER",
  "expiresInDays": 7
}
```

| Field | Rules |
|---|---|
| `email` | Required |
| `roleCode` | Required seeded org role |
| `expiresInDays` | 1–90 |

**Example response**

```json
{
  "success": true,
  "data": {
    "id": "cccccccc-dddd-eeee-ffff-000000000001",
    "organizationId": "11111111-2222-3333-4444-555555555555",
    "email": "new.dev@example.com",
    "roleCode": "MEMBER",
    "status": "PENDING",
    "expiresAt": "2026-08-15T10:00:00Z",
    "invitedBy": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "createdAt": "2026-08-08T10:00:00Z",
    "acceptedAt": null,
    "token": "a3f1…raw-hex-token-returned-once"
  }
}
```

**Errors:** `401`, `403`, `404`, `400`, `409` (business conflict if applicable).

Frontend/email must deliver the raw token (or accept URL containing it) out-of-band; DevFlow stores only the hash.

---

### GET `/api/organizations/{organizationId}/invitations`

| | |
|---|---|
| **Authentication** | Bearer JWT |
| **Authorization** | `organization.manage_members` (or equivalent org admin path) |
| **Query** | `page`, `size` |
| **Response** | `ApiResponse<PageResponse<InvitationResponse>>` with `token: null` |

**Pagination:** standard `PageResponse`.

**Errors:** `401`, `403`, `404`.

---

### DELETE `/api/invitations/{invitationId}`

| | |
|---|---|
| **Authentication** | Bearer JWT |
| **Authorization** | `organization.manage_members` on owning org |
| **Response** | `204 No Content` |
| **Behavior** | Sets status `REVOKED` |
| **Side effect** | `INVITATION_REVOKED` |

**Errors:** `401`, `403`, `404`.

---

### POST `/api/invitations/{token}/accept`

| | |
|---|---|
| **Authentication** | Bearer JWT (invitee must be logged in) |
| **Authorization** | Authenticated; JWT `email` claim must match invitation email (case-insensitive) |
| **Path** | Raw invitation token (not invitation UUID) |
| **Response** | `ApiResponse<MembershipResponse>` |
| **Behavior** | Hash token → load invitation → validate `PENDING` + not expired → create org membership → mark `ACCEPTED` |
| **Side effects** | `INVITATION_ACCEPTED`; `ORGANIZATION_MEMBER_ADDED` |

**Accept rules**

1. Invitation status is `PENDING`
2. `expiresAt` is in the future
3. JWT email matches invitation email
4. User is not already an org member (`409` if already member)

**Example**

```http
POST /api/invitations/a3f1…raw-hex-token/accept HTTP/1.1
Host: localhost:8080
Authorization: Bearer …
```

```json
{
  "success": true,
  "data": {
    "id": "99999999-aaaa-bbbb-cccc-dddddddddddd",
    "organizationId": "11111111-2222-3333-4444-555555555555",
    "userId": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
    "roleCode": "MEMBER",
    "status": "ACTIVE",
    "joinedAt": "2026-08-08T11:00:00Z",
    "createdAt": "2026-08-08T11:00:00Z",
    "updatedAt": "2026-08-08T11:00:00Z"
  }
}
```

**Errors**

| Status | Code | When |
|---|---|---|
| 401 | `UNAUTHORIZED` | Missing/invalid JWT |
| 403 | `FORBIDDEN` | JWT email does not match invitation |
| 404 | `NOT_FOUND` | Unknown token / not pending |
| 409 | `CONFLICT` | Already a member |
| 400 | `BAD_REQUEST` / `VALIDATION_FAILED` | Expired or invalid state |

---

## Lifecycle

```
PENDING ──accept──► ACCEPTED
   │
   ├──revoke──► REVOKED
   └──expire──► EXPIRED (on accept attempt or future sweeper)
```

---

## Common errors

| Status | Code | Typical cause |
|---|---|---|
| 401 | `UNAUTHORIZED` | Missing/invalid JWT |
| 403 | `FORBIDDEN` | Not allowed to manage invites / email mismatch |
| 404 | `NOT_FOUND` | Unknown invitation or token |
| 409 | `CONFLICT` | User already in organization |
| 400 | `VALIDATION_FAILED` | Bad `expiresInDays` / email / role |
