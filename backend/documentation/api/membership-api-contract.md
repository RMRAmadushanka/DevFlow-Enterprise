# Membership API Contract — Phase 3

Organization membership APIs owned by **organization-service** (`services/organization-service`).

**Gateway:** `http://localhost:8080`  
**Base path:** `/api/organizations/{organizationId}/members`  
**Authentication:** `Authorization: Bearer {access_token}`

Membership links an application `userId` (from user-service) to an organization with a seeded RBAC `roleCode` (`OWNER`, `ADMIN`, `MEMBER`, `GUEST`).

Unique key: `(organization_id, user_id)`.

---

## Response envelope

Same `ApiResponse` / `PageResponse` as [user-api-contract.md](./user-api-contract.md).

---

## Endpoints

### GET `/api/organizations/{organizationId}/members`

| | |
|---|---|
| **Authentication** | Bearer JWT |
| **Authorization** | `organization.read` |
| **Query** | `page` (default 0), `size` (default 20, max 100) |
| **Response** | `ApiResponse<PageResponse<MembershipResponse>>` |

**Pagination:** standard `PageResponse`.

**Example**

```http
GET /api/organizations/11111111-2222-3333-4444-555555555555/members?page=0&size=20 HTTP/1.1
Authorization: Bearer …
```

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "99999999-aaaa-bbbb-cccc-dddddddddddd",
        "organizationId": "11111111-2222-3333-4444-555555555555",
        "userId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        "roleCode": "OWNER",
        "status": "ACTIVE",
        "joinedAt": "2026-08-01T12:00:00Z",
        "createdAt": "2026-08-01T12:00:00Z",
        "updatedAt": "2026-08-01T12:00:00Z"
      }
    ],
    "page": 0,
    "pageSize": 20,
    "totalElements": 1,
    "totalPages": 1
  }
}
```

**Errors:** `401`, `403`, `404`.

---

### POST `/api/organizations/{organizationId}/members`

| | |
|---|---|
| **Authentication** | Bearer JWT |
| **Authorization** | `organization.manage_members` |
| **Request** | `AddMemberRequest` |
| **Response** | `201` + `ApiResponse<MembershipResponse>` |
| **Side effect** | `ORGANIZATION_MEMBER_ADDED` on `membership-events` |

**Request**

```json
{
  "userId": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
  "roleCode": "MEMBER"
}
```

| Field | Rules |
|---|---|
| `userId` | Required UUID (must exist in user-service) |
| `roleCode` | Required seeded role code |

**Errors:** `401`, `403`, `404` (org/role/user), `409` (already a member), `400`.

---

### PATCH `/api/organizations/{organizationId}/members/{userId}`

| | |
|---|---|
| **Authentication** | Bearer JWT |
| **Authorization** | `organization.manage_members` |
| **Request** | `UpdateMemberRequest` |
| **Response** | `ApiResponse<MembershipResponse>` |
| **Side effect** | `ORGANIZATION_ROLE_CHANGED` when role changes (topic `membership-events`) |

**Request**

```json
{
  "roleCode": "ADMIN",
  "status": "ACTIVE"
}
```

| Field | Values |
|---|---|
| `roleCode` | Optional; `OWNER` \| `ADMIN` \| `MEMBER` \| `GUEST` |
| `status` | Optional; `ACTIVE` \| `INACTIVE` |

**Errors:** `401`, `403`, `404`, `400`.

---

### DELETE `/api/organizations/{organizationId}/members/{userId}`

| | |
|---|---|
| **Authentication** | Bearer JWT |
| **Authorization** | `organization.manage_members` |
| **Response** | `204 No Content` |
| **Behavior** | Hard delete membership row |
| **Side effect** | `ORGANIZATION_MEMBER_REMOVED` on `membership-events` |

**Errors:** `401`, `403`, `404`.

---

## Effective permissions for a member

```http
GET /api/organizations/{organizationId}/members/{userId}/permissions
Authorization: Bearer …
```

Returns `ApiResponse<List<PermissionResponse>>` for the member’s role matrix (seeded `role_permissions`).

---

## Invitation vs direct add

| Path | Use |
|---|---|
| Direct `POST .../members` | Internal/admin add when `userId` already known |
| Invitations | Email invite + token accept → creates membership (see [invitation-api-contract.md](./invitation-api-contract.md)) |

---

## Common errors

| Status | Code | Typical cause |
|---|---|---|
| 401 | `UNAUTHORIZED` | Missing/invalid JWT |
| 403 | `FORBIDDEN` | Missing `organization.manage_members` / `organization.read` |
| 404 | `NOT_FOUND` | Unknown org, member, or role |
| 409 | `CONFLICT` | Duplicate `(organizationId, userId)` |
| 400 | `VALIDATION_FAILED` | Invalid `roleCode` / `status` |
