# Team API Contract — Phase 3

Team APIs owned by **organization-service** (`services/organization-service`).

**Gateway:** `http://localhost:8080`  
**Paths:**

- Nested: `/api/organizations/{organizationId}/teams`
- Direct: `/api/teams/{teamId}`

**Authentication:** `Authorization: Bearer {access_token}`  
**Authorization:** Organization RBAC permission codes (`team.*`). Platform `ADMIN` / `SUPER_ADMIN` bypass.

Teams belong to exactly one organization. Slug uniqueness is per organization: `(organization_id, slug)`.

---

## Response envelope

Same `ApiResponse` / `PageResponse` as [user-api-contract.md](./user-api-contract.md).

---

## Endpoints

### POST `/api/organizations/{organizationId}/teams`

| | |
|---|---|
| **Authentication** | Bearer JWT |
| **Authorization** | `team.create` |
| **Request** | `CreateTeamRequest` |
| **Response** | `201` + `ApiResponse<TeamResponse>` |
| **Side effect** | `TEAM_CREATED` on `team-events` |

**Request**

```json
{
  "name": "Platform",
  "slug": "platform",
  "description": "Platform engineering"
}
```

| Field | Rules |
|---|---|
| `name` | Required, 2–120 |
| `slug` | Required, 2–64, lowercase kebab |
| `description` | Optional |

**Errors:** `401`, `403`, `404` (org), `409` (slug), `400`.

---

### GET `/api/organizations/{organizationId}/teams`

| | |
|---|---|
| **Authentication** | Bearer JWT |
| **Authorization** | `team.read` |
| **Query** | `page` (default 0), `size` (default 20, max 100) |
| **Response** | `ApiResponse<PageResponse<TeamResponse>>` |

**Pagination:** standard `PageResponse`.

**Errors:** `401`, `403`, `404`.

---

### GET `/api/teams/{teamId}`

| | |
|---|---|
| **Authentication** | Bearer JWT |
| **Authorization** | `team.read` on owning organization |
| **Response** | `ApiResponse<TeamResponse>` |

**Example**

```http
GET /api/teams/aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee HTTP/1.1
Authorization: Bearer …
```

```json
{
  "success": true,
  "data": {
    "id": "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
    "organizationId": "11111111-2222-3333-4444-555555555555",
    "name": "Platform",
    "slug": "platform",
    "description": "Platform engineering",
    "createdBy": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "createdAt": "2026-08-08T10:00:00Z",
    "updatedAt": "2026-08-08T10:00:00Z"
  }
}
```

**Errors:** `401`, `403`, `404`.

---

### PATCH `/api/teams/{teamId}`

| | |
|---|---|
| **Authentication** | Bearer JWT |
| **Authorization** | `team.update` |
| **Request** | `UpdateTeamRequest` (partial: `name`, `slug`, `description`) |
| **Response** | `ApiResponse<TeamResponse>` |
| **Side effect** | `TEAM_UPDATED` |

**Errors:** `401`, `403`, `404`, `409`, `400`.

---

### DELETE `/api/teams/{teamId}`

| | |
|---|---|
| **Authentication** | Bearer JWT |
| **Authorization** | `team.delete` |
| **Response** | `204 No Content` |
| **Behavior** | Hard delete team and cascading team memberships |
| **Side effect** | Publishes `TEAM_UPDATED` with payload flag `deleted: true` (no separate `TEAM_DELETED` type) |

**Errors:** `401`, `403`, `404`.

---

### GET `/api/teams/{teamId}/members`

| | |
|---|---|
| **Authentication** | Bearer JWT |
| **Authorization** | `team.read` |
| **Query** | `page`, `size` |
| **Response** | `ApiResponse<PageResponse<TeamMembershipResponse>>` |

**`TeamMembershipResponse`:** `id`, `teamId`, `userId`, `role`, `joinedAt`, `createdAt`, `updatedAt`

Team roles: `TEAM_ADMIN` | `TEAM_MEMBER` | `TEAM_VIEWER`

**Errors:** `401`, `403`, `404`.

---

### POST `/api/teams/{teamId}/members`

| | |
|---|---|
| **Authentication** | Bearer JWT |
| **Authorization** | `team.manage_members` |
| **Request** | `AddTeamMemberRequest` |
| **Response** | `201` + `ApiResponse<TeamMembershipResponse>` |
| **Constraint** | User must already be an organization member |
| **Side effect** | `TEAM_MEMBER_ADDED` |

**Request**

```json
{
  "userId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "role": "TEAM_MEMBER"
}
```

**Errors:** `401`, `403`, `404`, `409` (already a team member), `400`.

---

### DELETE `/api/teams/{teamId}/members/{userId}`

| | |
|---|---|
| **Authentication** | Bearer JWT |
| **Authorization** | `team.manage_members` |
| **Response** | `204 No Content` |
| **Behavior** | Hard delete membership row |
| **Side effect** | `TEAM_MEMBER_REMOVED` |

**Errors:** `401`, `403`, `404`.

---

## Common errors

| Status | Code | Typical cause |
|---|---|---|
| 401 | `UNAUTHORIZED` | Missing/invalid JWT |
| 403 | `FORBIDDEN` | Missing `team.*` permission |
| 404 | `NOT_FOUND` | Unknown team/org/member |
| 409 | `CONFLICT` | Duplicate team slug or membership |
| 400 | `VALIDATION_FAILED` | Invalid role/slug |
