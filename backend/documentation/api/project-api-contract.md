# Project API Contract — Phase 4

Project management APIs owned by **project-service** (`services/project-service`, port `8084`, DB `devflow_project`).

**Gateway:** `http://localhost:8080`  
**Base path:** `/api/projects`  
**Authentication:** `Authorization: Bearer {access_token}` on all endpoints below (except health/actuator/swagger as configured).

Actor resolution: JWT `sub` → user-service `GET /api/users/by-external-id/{sub}` (fallback `GET /api/users/me`) → application `userId`.

Business authorization uses project-role permissions (`project.*`) plus org Feign checks for `project.create` / org discovery (`project.read` or `organization.read`). Platform Keycloak roles `ADMIN` / `SUPER_ADMIN` bypass project permission checks.

---

## Response envelope

Same `ApiResponse` / `PageResponse` as [user-api-contract.md](./user-api-contract.md).

```json
{
  "success": true,
  "data": { },
  "error": null,
  "correlationId": "…",
  "timestamp": "2026-08-08T10:00:00Z"
}
```

Paginated lists use `PageResponse` with **`pageSize`** (not `size`):

```json
{
  "items": [],
  "page": 0,
  "pageSize": 20,
  "totalElements": 0,
  "totalPages": 0
}
```

**Pagination defaults:** `page` default `0`, `size` query param default `20`, max `100` (mapped to `pageSize` in the response).

**Common errors:**

| Status | When |
|---|---|
| `400` | Bean Validation failures (`VALIDATION_FAILED`) |
| `401` | Missing/invalid JWT |
| `403` | Authenticated but missing project/org permission |
| `404` | Project / member / tag not found |
| `409` | Conflict (duplicate key/tag/member/favorite) |
| `422` | Semantic domain rule failure (invalid status transition, archived mutability) |
| `500` | Unexpected server error |

---

## Enums

| Field | Values |
|---|---|
| `status` | `PLANNING`, `ACTIVE`, `ON_HOLD`, `COMPLETED`, `ARCHIVED` |
| `health` | `HEALTHY`, `AT_RISK`, `CRITICAL`, `UNKNOWN` |
| `visibility` | `PRIVATE`, `ORGANIZATION`, `TEAM` |
| Project roles | `PROJECT_OWNER`, `PROJECT_ADMIN`, `PROJECT_MANAGER`, `PROJECT_DEVELOPER`, `PROJECT_VIEWER`, `PROJECT_GUEST` |
| Member status | `ACTIVE`, `INACTIVE`, `REMOVED` |
| Default project view (settings) | `LIST`, `BOARD`, `TIMELINE`, `OVERVIEW` |

**Visibility notes (Phase 4):**

- `PRIVATE` — project members only
- `ORGANIZATION` — members **or** org users with `project.read` / `organization.read` (Feign)
- `TEAM` — treated like **members-only** in Phase 4 (same as `PRIVATE` for read access)

**Project key:**

- Create body JSON property is **`"key"`** (Java field `projectKey`; also accepts alias `projectKey`)
- Pattern: uppercase `^[A-Z0-9]{2,10}$`, unique per `organizationId`
- **Immutable after create** (`updatable = false`); JSON responses expose **`"key"`** (Java field `projectKey` via `@JsonProperty("key")`)

**DELETE** = soft archive (`status=ARCHIVED`, `archivedAt` set) and emits `PROJECT_DELETED` (not hard delete). Prefer `POST .../archive` for normal archive (`PROJECT_ARCHIVED`).

---

## Projects

### POST `/api/projects`

| | |
|---|---|
| **Purpose** | Create project with owner membership and default settings |
| **Authentication** | Bearer JWT |
| **Authorization** | Org permission `project.create` (Feign); platform admin bypass |
| **Request** | `CreateProjectRequest` |
| **Response** | `201` + `ApiResponse<ProjectResponse>` |
| **Side effects** | Creates `PROJECT_OWNER` member; default `project_settings`; activity + outbox `PROJECT_CREATED` |

**Request**

```json
{
  "organizationId": "11111111-2222-3333-4444-555555555555",
  "name": "API Gateway",
  "description": "Edge gateway and routing",
  "key": "API",
  "icon": "folder",
  "status": "ACTIVE",
  "visibility": "PRIVATE"
}
```

| Field | Rules |
|---|---|
| `organizationId` | Required UUID |
| `name` | Required, 2–160 chars |
| `description` | Optional, max 2000 |
| `key` | Required; alias `projectKey`; `^[A-Z0-9]{2,10}$`; unique per org |
| `icon` | Optional, max 64 |
| `status` | Optional; default `ACTIVE`; cannot be `ARCHIVED` |
| `visibility` | Optional; default `PRIVATE` |

**Errors:** `401`, `403` missing `project.create`, `400` validation, `409` duplicate key.

**Example response `data`**

```json
{
  "id": "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
  "organizationId": "11111111-2222-3333-4444-555555555555",
  "name": "API Gateway",
  "slug": "api-gateway",
  "description": "Edge gateway and routing",
  "key": "API",
  "icon": "folder",
  "status": "ACTIVE",
  "health": "UNKNOWN",
  "visibility": "PRIVATE",
  "createdBy": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "archivedAt": null,
  "version": 0,
  "createdAt": "2026-08-08T10:00:00Z",
  "updatedAt": "2026-08-08T10:00:00Z"
}
```

---

### GET `/api/projects`

| | |
|---|---|
| **Purpose** | List / search projects visible to the caller |
| **Authentication** | Bearer JWT |
| **Authorization** | Returns member projects; with `organizationId`, also `ORGANIZATION`-visibility projects if org `project.read` or `organization.read` |
| **Query** | `organizationId`, `status`, `health`, `visibility`, `search`, `tag`, `favorite`, `page`, `size`, `sort` |
| **Response** | `ApiResponse<PageResponse<ProjectSummaryResponse>>` |

| Query | Notes |
|---|---|
| `search` | Case-insensitive match on name, slug, projectKey, description |
| `tag` | Exact tag name (case-insensitive) |
| `favorite` | `true` = only caller’s favorites |
| `sort` | `property,asc\|desc`; whitelist: `name`, `slug`, `projectKey`, `status`, `health`, `visibility`, `createdAt`, `updatedAt`; default `createdAt,desc` |
| `page` / `size` | Default `0` / `20`, max size `100` → response `pageSize` |

**Errors:** `401`.

Without `organizationId`, only projects where the caller is an active member are returned (no cross-org Feign scan).

---

### GET `/api/projects/{projectId}`

| | |
|---|---|
| **Purpose** | Project detail (member count, favorite flag, tags) |
| **Authentication** | Bearer JWT |
| **Authorization** | `project.read` via membership or org visibility rules |
| **Response** | `ApiResponse<ProjectDetailResponse>` |

**Errors:** `401`, `403`, `404`.

**Example `data` fields:** same core as `ProjectResponse` plus `memberCount`, `favorite`, `tags[]`.

---

### GET `/api/projects/{projectId}/summary`

| | |
|---|---|
| **Purpose** | Compact summary for cards / favorites |
| **Authentication** | Bearer JWT |
| **Authorization** | `project.read` |
| **Response** | `ApiResponse<ProjectSummaryResponse>` |

**Errors:** `401`, `403`, `404`.

---

### PATCH `/api/projects/{projectId}`

| | |
|---|---|
| **Purpose** | Update mutable project fields (not key) |
| **Authentication** | Bearer JWT |
| **Authorization** | `project.update` |
| **Request** | `UpdateProjectRequest` |
| **Response** | `ApiResponse<ProjectResponse>` |
| **Side effects** | Activity + `PROJECT_UPDATED` |

**Request** (all optional)

```json
{
  "name": "API Gateway",
  "description": "Updated description",
  "icon": "gateway",
  "status": "ON_HOLD",
  "health": "AT_RISK",
  "visibility": "ORGANIZATION"
}
```

Cannot set `status=ARCHIVED` via PATCH (use archive/delete or dedicated status endpoint rules). Cannot change status while already `ARCHIVED` (restore first). Slug is not regenerated on name change. Key is never accepted on update.

Prefer dedicated endpoints for status/health when the UI only changes those fields (emits distinct domain events).

**Errors:** `401`, `403`, `404`, `400` validation, `422` invalid status.

---

### PATCH `/api/projects/{projectId}/status`

| | |
|---|---|
| **Purpose** | Update project status with transition validation |
| **Authentication** | Bearer JWT |
| **Authorization** | `project.update` (`ProjectAuthorizationService.canUpdateProject`) |
| **Request** | `{ "status": "ON_HOLD" }` (`UpdateProjectStatusRequest`) |
| **Response** | `ApiResponse<ProjectResponse>` |
| **Side effects** | Activity + **`PROJECT_STATUS_CHANGED`** (outbox → Kafka) |

**Rules**

- Cannot set `ARCHIVED` — use `POST .../archive` or `DELETE`
- Cannot change status while already `ARCHIVED` — restore first
- Allowed targets: `PLANNING`, `ACTIVE`, `ON_HOLD`, `COMPLETED`

**Example**

```http
PATCH /api/projects/11111111-1111-1111-1111-111111111111/status
Authorization: Bearer eyJ…
Content-Type: application/json

{ "status": "ON_HOLD" }
```

**Errors:** `401`, `403`, `404`, `400` (null/invalid enum), `422` invalid transition.

---

### PATCH `/api/projects/{projectId}/health`

| | |
|---|---|
| **Purpose** | Update project health indicator |
| **Authentication** | Bearer JWT |
| **Authorization** | `project.update` |
| **Request** | `{ "health": "AT_RISK" }` (`UpdateProjectHealthRequest`) |
| **Response** | `ApiResponse<ProjectResponse>` |
| **Side effects** | Activity + **`PROJECT_HEALTH_CHANGED`** |

**Rules:** Project must not be `ARCHIVED`.

**Errors:** `401`, `403`, `404`, `400` validation, `422` archived.

---

### DELETE `/api/projects/{projectId}`

| | |
|---|---|
| **Purpose** | Soft-delete: archive project |
| **Authentication** | Bearer JWT |
| **Authorization** | `project.delete` (owner) |
| **Response** | `ApiResponse<ProjectResponse>` |
| **Side effects** | `status=ARCHIVED`, `archivedAt` set; activity + **`PROJECT_DELETED`** |

**Errors:** `401`, `403`, `404`, `422` already archived.

---

### POST `/api/projects/{projectId}/archive`

| | |
|---|---|
| **Purpose** | Archive project (normal flow) |
| **Authentication** | Bearer JWT |
| **Authorization** | `project.archive` |
| **Response** | `ApiResponse<ProjectResponse>` |
| **Side effects** | Soft archive + **`PROJECT_ARCHIVED`** |

**Errors:** `401`, `403`, `404`, `422` already archived.

---

### POST `/api/projects/{projectId}/restore`

| | |
|---|---|
| **Purpose** | Restore archived project to `ACTIVE` |
| **Authentication** | Bearer JWT |
| **Authorization** | `project.archive` |
| **Response** | `ApiResponse<ProjectResponse>` |
| **Side effects** | Clears `archivedAt`; activity + `PROJECT_RESTORED` |

**Errors:** `401`, `403`, `404`, `422` not archived.

---

### POST `/api/projects/{projectId}/ownership/transfer`

| | |
|---|---|
| **Purpose** | Transfer project ownership |
| **Authentication** | Bearer JWT |
| **Authorization** | `project.manage_members` **or** current `PROJECT_OWNER` |
| **Request** | `{ "newOwnerUserId": "<uuid>" }` |
| **Response** | `ApiResponse<ProjectResponse>` |
| **Side effects** | New/updated membership as `PROJECT_OWNER`; previous owners demoted to `PROJECT_ADMIN`; `PROJECT_OWNERSHIP_TRANSFERRED` |

**Errors:** `401`, `403`, `404`.

---

## Members

Base: `/api/projects/{projectId}/members`

### GET `/api/projects/{projectId}/members`

| | |
|---|---|
| **Purpose** | List project members |
| **Authentication** | Bearer JWT |
| **Authorization** | `project.read` |
| **Query** | `page`, `size` |
| **Response** | `ApiResponse<PageResponse<ProjectMemberResponse>>` |

**Errors:** `401`, `403`, `404`.

---

### POST `/api/projects/{projectId}/members`

| | |
|---|---|
| **Purpose** | Add member |
| **Authentication** | Bearer JWT |
| **Authorization** | `project.manage_members` |
| **Request** | `{ "userId": "<uuid>", "role": "PROJECT_DEVELOPER" }` |
| **Response** | `201` + `ApiResponse<ProjectMemberResponse>` |
| **Side effects** | Verifies user via Feign; `PROJECT_MEMBER_ADDED` |

Cannot assign `PROJECT_OWNER` here (use ownership transfer).

**Errors:** `401`, `403`, `404` user/project, `409` already member.

---

### PATCH `/api/projects/{projectId}/members/{userId}`

| | |
|---|---|
| **Purpose** | Update member role/status |
| **Authentication** | Bearer JWT |
| **Authorization** | `project.manage_members` |
| **Request** | `{ "role": "PROJECT_MANAGER", "status": "ACTIVE" }` (optional fields) |
| **Response** | `ApiResponse<ProjectMemberResponse>` |
| **Side effects** | `PROJECT_MEMBER_UPDATED` |

Cannot promote to `PROJECT_OWNER` via PATCH. Cannot demote/inactivate the last active owner (`409`).

**Errors:** `401`, `403`, `404`, `409`.

---

### DELETE `/api/projects/{projectId}/members/{userId}`

| | |
|---|---|
| **Purpose** | Remove member |
| **Authentication** | Bearer JWT |
| **Authorization** | `project.manage_members` |
| **Response** | `204` No Content |
| **Side effects** | `PROJECT_MEMBER_REMOVED` |

Cannot remove last active owner (`409`).

**Errors:** `401`, `403`, `404`, `409`.

---

## Settings

Base: `/api/projects/{projectId}/settings`

### GET `/api/projects/{projectId}/settings`

| | |
|---|---|
| **Purpose** | Get project settings (1:1) |
| **Authentication** | Bearer JWT |
| **Authorization** | `project.read` |
| **Response** | `ApiResponse<ProjectSettingsResponse>` |

---

### PATCH `/api/projects/{projectId}/settings`

| | |
|---|---|
| **Purpose** | Update settings |
| **Authentication** | Bearer JWT |
| **Authorization** | `project.manage_settings` |
| **Request** | `UpdateProjectSettingsRequest` (all optional) |
| **Response** | `ApiResponse<ProjectSettingsResponse>` |
| **Side effects** | `PROJECT_SETTINGS_UPDATED` |

```json
{
  "defaultVisibility": "ORGANIZATION",
  "allowMemberInvites": true,
  "allowGuestAccess": false,
  "timezone": "UTC",
  "defaultProjectView": "OVERVIEW"
}
```

**Errors:** `401`, `403`, `404`, `400` validation.

---

## Tags

Base: `/api/projects/{projectId}/tags`

### GET `/api/projects/{projectId}/tags`

| | |
|---|---|
| **Purpose** | List tags |
| **Authentication** | Bearer JWT |
| **Authorization** | `project.read` |
| **Response** | `ApiResponse<List<ProjectTagResponse>>` (not paginated) |

---

### POST `/api/projects/{projectId}/tags`

| | |
|---|---|
| **Purpose** | Create tag |
| **Authentication** | Bearer JWT |
| **Authorization** | `project.manage_tags` |
| **Request** | `{ "name": "backend", "color": "#2563EB" }` |
| **Response** | `201` + `ApiResponse<ProjectTagResponse>` |
| **Side effects** | `PROJECT_TAG_ADDED` |

`color` must match `^#[0-9A-Fa-f]{6}$`. Name unique per project (case-insensitive).

**Errors:** `401`, `403`, `404`, `400`, `409`.

---

### PATCH `/api/projects/{projectId}/tags/{tagId}`

| | |
|---|---|
| **Purpose** | Update tag |
| **Authentication** | Bearer JWT |
| **Authorization** | `project.manage_tags` |
| **Request** | `{ "name": "platform", "color": "#0EA5E9" }` |
| **Response** | `ApiResponse<ProjectTagResponse>` |
| **Side effects** | `PROJECT_TAG_UPDATED` |

---

### DELETE `/api/projects/{projectId}/tags/{tagId}`

| | |
|---|---|
| **Purpose** | Delete tag |
| **Authentication** | Bearer JWT |
| **Authorization** | `project.manage_tags` |
| **Response** | `204` No Content |
| **Side effects** | `PROJECT_TAG_REMOVED` |

---

## Favorites

### GET `/api/projects/favorites`

| | |
|---|---|
| **Purpose** | List favorited projects for current user |
| **Authentication** | Bearer JWT |
| **Authorization** | Authenticated; each summary still respects read access |
| **Query** | `page`, `size` |
| **Response** | `ApiResponse<PageResponse<ProjectSummaryResponse>>` |

Route is registered on `ProjectFavoriteController` as `/api/projects/favorites` (must not collide with `/{projectId}` — favorites path is static).

---

### POST `/api/projects/{projectId}/favorite`

| | |
|---|---|
| **Purpose** | Favorite project |
| **Authentication** | Bearer JWT |
| **Authorization** | `project.read` |
| **Response** | `201` + `ApiResponse<ProjectFavoriteResponse>` |
| **Side effects** | `PROJECT_FAVORITED` |

**Errors:** `409` already favorited.

---

### DELETE `/api/projects/{projectId}/favorite`

| | |
|---|---|
| **Purpose** | Unfavorite project |
| **Authentication** | Bearer JWT |
| **Authorization** | `project.read` |
| **Response** | `204` No Content |
| **Side effects** | `PROJECT_UNFAVORITED` |

---

## Activity

### GET `/api/projects/{projectId}/activity`

| | |
|---|---|
| **Purpose** | List project activity feed |
| **Authentication** | Bearer JWT |
| **Authorization** | `project.view_activity` (active membership with that permission; guests lack it; platform admin bypass) |
| **Query** | `activityType` (optional filter), `page`, `size` |
| **Response** | `ApiResponse<PageResponse<ProjectActivityResponse>>` |

```json
{
  "id": "…",
  "projectId": "…",
  "actorUserId": "…",
  "activityType": "PROJECT_CREATED",
  "description": "Project created",
  "metadata": { "name": "API Gateway", "projectKey": "API" },
  "createdAt": "2026-08-08T10:00:00Z"
}
```

**Errors:** `401`, `403`, `404`.

---

## RBAC quick reference

| Permission | OWNER | ADMIN | MANAGER | DEVELOPER | VIEWER | GUEST |
|---|---|---|---|---|---|---|
| `project.read` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| `project.update` | ✓ | ✓ | ✓ | | | |
| `project.delete` | ✓ | | | | | |
| `project.archive` | ✓ | ✓ | | | | |
| `project.manage_members` | ✓ | ✓ | ✓ | | | |
| `project.manage_settings` | ✓ | ✓ | | | | |
| `project.manage_tags` | ✓ | ✓ | ✓ | | | |
| `project.view_activity` | ✓ | ✓ | ✓ | ✓ | ✓ | |
| `project.manage_project` | ✓ | ✓ | | | | |

Org-level (Feign): `project.create` for create; `project.read` / `organization.read` for ORGANIZATION visibility discovery.

---

## Not in Phase 4

- No `POST /api/projects/{id}/duplicate` (or clone) endpoint
- No tasks, sprints, board, repository, environments, analytics, documents, releases APIs in this service

See [../frontend/project-feature-api-mapping.md](../frontend/project-feature-api-mapping.md) and [../events/phase-4-events.md](../events/phase-4-events.md).
