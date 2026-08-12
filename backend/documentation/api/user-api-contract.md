# User API Contract — Phase 3

Application user profile APIs owned by **user-service** (`services/user-service`, port `8082`).

**Gateway:** `http://localhost:8080`  
**Base path:** `/api/users`  
**Identity:** Keycloak JWT `sub` → `externalIdentityId`. Email is never the primary key.

All mutating and private reads require:

```http
Authorization: Bearer {access_token}
```

Optional: `X-Correlation-Id: {uuid}`

---

## Response envelope

Success and errors use `ApiResponse` from `common-library`:

```json
{
  "success": true,
  "data": { },
  "error": null,
  "correlationId": "…",
  "timestamp": "2026-08-08T10:00:00Z"
}
```

Error body:

```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "NOT_FOUND",
    "message": "User not found",
    "details": null
  },
  "correlationId": "…",
  "timestamp": "…"
}
```

Paginated lists wrap `PageResponse`:

```json
{
  "items": [],
  "page": 0,
  "pageSize": 20,
  "totalElements": 0,
  "totalPages": 0
}
```

---

## Identity model

| Concept | Source |
|---|---|
| Stable IdP key | JWT `sub` → `users.external_identity_id` |
| Application PK | `users.id` (UUID) |
| Email | Attribute only; unique among non-`DELETED` rows |

`GET /api/users/me` (and profile/preference reads) **upsert** the local user from JWT claims when missing or stale.

---

## Endpoints

### GET `/api/users/me`

| | |
|---|---|
| **Authentication** | Bearer JWT |
| **Authorization** | Any authenticated user |
| **Request** | None |
| **Response** | `ApiResponse<UserResponse>` |
| **Behavior** | Upsert by `sub`: create on first call (`USER_CREATED`) or sync profile fields (`USER_UPDATED` if changed) |

**Errors**

| Status | Code | When |
|---|---|---|
| 401 | `UNAUTHORIZED` | Missing/invalid JWT |
| 404 | `NOT_FOUND` | Local user status is `DELETED` |

**Example**

```http
GET /api/users/me HTTP/1.1
Host: localhost:8080
Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...
```

```json
{
  "success": true,
  "data": {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "externalIdentityId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    "username": "ada",
    "email": "ada@example.com",
    "firstName": "Ada",
    "lastName": "Lovelace",
    "displayName": "Ada Lovelace",
    "avatarUrl": null,
    "timezone": "UTC",
    "locale": "en",
    "status": "ACTIVE",
    "theme": "system",
    "notifyEmail": true,
    "notifyInApp": true,
    "createdAt": "2026-08-01T12:00:00Z",
    "updatedAt": "2026-08-08T09:00:00Z"
  },
  "correlationId": "…",
  "timestamp": "…"
}
```

---

### GET `/api/users/{userId}`

| | |
|---|---|
| **Authentication** | Bearer JWT |
| **Authorization** | Authenticated (any user with valid JWT) |
| **Request** | Path `userId` (UUID) |
| **Response** | `ApiResponse<UserResponse>` |

**Errors:** `401`, `404` if user missing or soft-deleted.

---

### GET `/api/users/by-external-id/{externalIdentityId}`

| | |
|---|---|
| **Authentication** | Bearer JWT |
| **Authorization** | Authenticated; used by organization-service Feign (`CurrentUserResolver`) |
| **Request** | Path `externalIdentityId` = Keycloak `sub` |
| **Response** | `ApiResponse<UserResponse>` |

**Errors:** `401`, `404`.

**Example**

```http
GET /api/users/by-external-id/f47ac10b-58cc-4372-a567-0e02b2c3d479 HTTP/1.1
Authorization: Bearer …
```

---

### PATCH `/api/users/me`

| | |
|---|---|
| **Authentication** | Bearer JWT |
| **Authorization** | Self only (current JWT subject) |
| **Request** | `UpdateUserProfileRequest` (all fields optional) |
| **Response** | `ApiResponse<UserProfileResponse>` |
| **Side effect** | Publishes `USER_UPDATED` on `user-events` |

**Request body**

```json
{
  "firstName": "Ada",
  "lastName": "Lovelace",
  "displayName": "Ada L.",
  "avatarUrl": "https://cdn.example.com/a.png",
  "timezone": "America/New_York",
  "locale": "en-US"
}
```

**Errors:** `401`, `400`/`VALIDATION_FAILED`, `404`.

---

### PATCH `/api/users/me/preferences`

| | |
|---|---|
| **Authentication** | Bearer JWT |
| **Authorization** | Self only |
| **Request** | `UpdateUserPreferenceRequest` |
| **Response** | `ApiResponse<UserPreferenceResponse>` |
| **Side effect** | Publishes `USER_PREFERENCES_UPDATED` |

**Request body**

```json
{
  "theme": "dark",
  "notifyEmail": true,
  "notifyInApp": false
}
```

**Response data**

```json
{
  "userId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "theme": "dark",
  "notifyEmail": true,
  "notifyInApp": false
}
```

**Errors:** `401`, `400`, `404`.

---

### GET `/api/users/{userId}/organizations`

| | |
|---|---|
| **Authentication** | Bearer JWT |
| **Authorization** | Self, or Keycloak realm `ADMIN` / `SUPER_ADMIN` |
| **Request** | Path `userId`; query `page` (default 0), `size` (default 20, max 100) |
| **Response** | `ApiResponse<PageResponse<OrganizationSummaryResponse>>` |
| **Integration** | Feign → organization-service `GET /api/organizations/for-user/{userId}` |

**Pagination:** standard `PageResponse`.

**Errors:** `401`, `403` (other user’s orgs without platform admin), `404`.

**Example**

```http
GET /api/users/a1b2c3d4-e5f6-7890-abcd-ef1234567890/organizations?page=0&size=20 HTTP/1.1
Authorization: Bearer …
```

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "11111111-2222-3333-4444-555555555555",
        "name": "Acme Engineering",
        "slug": "acme-eng",
        "role": "OWNER"
      }
    ],
    "page": 0,
    "pageSize": 20,
    "totalElements": 1,
    "totalPages": 1
  }
}
```

---

## Related endpoints (same service)

| Method | Path | Notes |
|---|---|---|
| `GET` | `/api/users/me/profile` | Profile subset after upsert |
| `GET` | `/api/users/me/preferences` | Preference read after upsert |
| `GET` | `/api/v1/user/health` | Public health |

---

## DTO reference

**`UserResponse`:** `id`, `externalIdentityId`, `username`, `email`, `firstName`, `lastName`, `displayName`, `avatarUrl`, `timezone`, `locale`, `status`, `theme`, `notifyEmail`, `notifyInApp`, `createdAt`, `updatedAt`

**`UserProfileResponse`:** profile fields without preference flags

---

## Common errors

| Status | Code | Typical cause |
|---|---|---|
| 401 | `UNAUTHORIZED` | No/invalid Bearer token |
| 403 | `FORBIDDEN` | Cross-user org list without platform admin |
| 404 | `NOT_FOUND` | Unknown or `DELETED` user |
| 409 | `CONFLICT` | Unique constraint (rare on upsert race; retry safe by `externalIdentityId`) |
| 400 | `VALIDATION_FAILED` | Bean Validation on PATCH bodies |
