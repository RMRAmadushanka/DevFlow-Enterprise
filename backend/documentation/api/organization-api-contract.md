# Organization API Contract — Phase 3

Organization lifecycle APIs owned by **organization-service** (`services/organization-service`, port `8083`).

**Gateway:** `http://localhost:8080`  
**Base path:** `/api/organizations`  
**Authentication:** `Authorization: Bearer {access_token}` on all endpoints below (except health).

Actor resolution: JWT `sub` → user-service `GET /api/users/by-external-id/{sub}` → application `userId`.

Business authorization uses seeded org RBAC permissions (not only Keycloak realm roles). Platform `ADMIN` / `SUPER_ADMIN` bypass org permission checks.

---

## Response envelope

Same `ApiResponse` / `PageResponse` as [user-api-contract.md](./user-api-contract.md).

---

## Endpoints

### POST `/api/organizations`

| | |
|---|---|
| **Authentication** | Bearer JWT |
| **Authorization** | Authenticated |
| **Request** | `CreateOrganizationRequest` |
| **Response** | `201` + `ApiResponse<OrganizationResponse>` |
| **Side effects** | Creates `OWNER` membership for actor; publishes `ORGANIZATION_CREATED` and `ORGANIZATION_MEMBER_ADDED` |

**Request**

```json
{
  "name": "Acme Engineering",
  "slug": "acme-eng",
  "description": "Product engineering org",
  "logoUrl": "https://cdn.example.com/logo.png"
}
```

| Field | Rules |
|---|---|
| `name` | Required, 2–120 chars |
| `slug` | Required, 2–64, `^[a-z0-9]+(?:-[a-z0-9]+)*$`, globally unique |
| `description` | Optional |
| `logoUrl` | Optional |

**Errors:** `401`, `400` validation, `409` slug conflict.

**Example response data**

```json
{
  "id": "11111111-2222-3333-4444-555555555555",
  "name": "Acme Engineering",
  "slug": "acme-eng",
  "description": "Product engineering org",
  "logoUrl": "https://cdn.example.com/logo.png",
  "status": "ACTIVE",
  "createdBy": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "createdAt": "2026-08-08T10:00:00Z",
  "updatedAt": "2026-08-08T10:00:00Z"
}
```

---

### GET `/api/organizations`

| | |
|---|---|
| **Authentication** | Bearer JWT |
| **Authorization** | Authenticated; returns orgs where caller has active membership |
| **Query** | `page` (default 0), `size` (default 20, max 100) |
| **Response** | `ApiResponse<PageResponse<OrganizationResponse>>` |

**Errors:** `401`.

---

### GET `/api/organizations/for-user/{userId}`

| | |
|---|---|
| **Authentication** | Bearer JWT |
| **Authorization** | Self, platform admin, or shared-org admin |
| **Query** | `page`, `size` |
| **Response** | `ApiResponse<PageResponse<OrganizationSummaryResponse>>` |

**`OrganizationSummaryResponse`:** `id`, `name`, `slug`, `role`

**Errors:** `401`, `403`, `404`.

Used by user-service Feign for `GET /api/users/{userId}/organizations`.

---

### GET `/api/organizations/{organizationId}`

| | |
|---|---|
| **Authentication** | Bearer JWT |
| **Authorization** | Permission `organization.read` |
| **Response** | `ApiResponse<OrganizationResponse>` |

**Errors:** `401`, `403`, `404`.

---

### PATCH `/api/organizations/{organizationId}`

| | |
|---|---|
| **Authentication** | Bearer JWT |
| **Authorization** | Permission `organization.update` |
| **Request** | `UpdateOrganizationRequest` (partial) |
| **Response** | `ApiResponse<OrganizationResponse>` |
| **Side effect** | `ORGANIZATION_UPDATED` |

**Request**

```json
{
  "name": "Acme Engineering Co",
  "slug": "acme-eng",
  "description": "Updated",
  "logoUrl": null,
  "status": "SUSPENDED"
}
```

Notes:

- `status` may be `ACTIVE` or `SUSPENDED` via PATCH.
- Archiving (`ARCHIVED`) is done via `DELETE`, not PATCH.
- Slug uniqueness → `409 CONFLICT`.

**Errors:** `401`, `403`, `404`, `409`, `400`.

---

### DELETE `/api/organizations/{organizationId}`

| | |
|---|---|
| **Authentication** | Bearer JWT |
| **Authorization** | Permission `organization.delete` |
| **Response** | `ApiResponse<OrganizationResponse>` with `status: ARCHIVED` |
| **Behavior** | Soft archive (not hard delete) |
| **Side effect** | `ORGANIZATION_ARCHIVED` |

**Errors:** `401`, `403`, `404`.

---

### GET `/api/organizations/{organizationId}/members`

Documented in [membership-api-contract.md](./membership-api-contract.md). Requires `organization.read`.

---

## RBAC read APIs (same service)

| Method | Path | Permission |
|---|---|---|
| `GET` | `/api/organizations/{organizationId}/roles` | Authenticated org member / platform admin |
| `GET` | `/api/organizations/{organizationId}/permissions` | Same |
| `GET` | `/api/organizations/{organizationId}/permission-matrix` | Same (`organization.read`) |
| `PUT` | `/api/organizations/{organizationId}/permission-matrix` | `role.manage` (OWNER/ADMIN by default; platform admin bypass) |
| `GET` | `/api/organizations/{organizationId}/members/{userId}/permissions` | Same as GET roles |

Seeded role codes: `OWNER`, `ADMIN`, `MEMBER`, `GUEST`.

`PUT` replaces the organization override table (`organization_role_permissions`). An empty override table means the global seeded `role_permissions` catalog still applies. OWNER always retains `organization.read`, `organization.update`, `organization.delete`, `organization.manage_members`, and `role.manage`. Request body:

```json
{
  "grants": [
    { "roleCode": "OWNER", "permissionCodes": ["organization.read", "role.manage"] },
    { "roleCode": "ADMIN", "permissionCodes": ["organization.read"] },
    { "roleCode": "MEMBER", "permissionCodes": ["organization.read"] },
    { "roleCode": "GUEST", "permissionCodes": ["organization.read"] }
  ]
}
```

All four role codes are required. Unknown permission codes return `400 VALIDATION_FAILED`.

---

## Common errors

| Status | Code | Typical cause |
|---|---|---|
| 401 | `UNAUTHORIZED` | Missing/invalid JWT |
| 403 | `FORBIDDEN` | Missing org permission |
| 404 | `NOT_FOUND` | Unknown org |
| 409 | `CONFLICT` | Duplicate slug |
| 400 | `VALIDATION_FAILED` | Invalid name/slug/status |
