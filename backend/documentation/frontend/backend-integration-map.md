# Frontend ↔ Backend Integration Map — F1

**Phase:** F1 analysis only (no application code changes).  
**Gateway base:** `http://localhost:8080`  
**Frontend:** Next.js 15 App Router (`frontend/`)  
**Date:** 2026-08-09

Related: [project-feature-api-mapping.md](./project-feature-api-mapping.md) (Phase 4 project detail), [backend-integration-plan.md](./backend-integration-plan.md).

---

## Legend

| Current Data Source | Meaning |
|---|---|
| **Mock** | In-memory feature service (`delay()`), no HTTP |
| **Partial API** | `apiClient` path exists behind feature flag; auth/Bearer incomplete |
| **API ready** | Backend endpoint exists; frontend not wired |
| **Gap** | UI exists; no backend owner in current phases |
| **Keycloak** | Identity Provider (login/tokens), not Spring auth-service |

**Envelope:** Backend success `{ success, data, error, correlationId, timestamp }`. Frontend `apiClient` unwraps `data`.

---

## 0. API ownership (service map)

| Path prefix | Owning service | Port |
|---|---|---|
| `/api/auth/**`, `/api/v1/auth/**` | auth-service | 8081 |
| `/api/users/**`, `/api/v1/user/**` | user-service | 8082 |
| `/api/organizations/**`, `/api/teams/**`, `/api/invitations/**`, `/api/v1/organization/**` | organization-service | 8083 |
| `/api/projects/**`, `/api/v1/project/**` | project-service | 8084 |
| `/api/tasks/**` | task-service | 8085 |
| `/api/sprints/**` | sprint-service (stub) | 8086 |
| `/api/documents/**` | document-service (stub) | 8087 |
| `/api/repositories/**` | repository-service (stub) | 8088 |
| `/api/deployments/**` | deployment-service (stub) | 8089 |
| `/api/notifications/**` | notification-service (stub) | 8090 |
| `/api/analytics/**`, `/api/dashboard/**` | analytics-service (stub) | 8091 |
| `/api/audit-logs/**` | audit-service (stub) | 8092 |
| OIDC authorize / token / logout | **Keycloak** realm `devflow` | 8180 |

---

## 1. Authentication & session

| Frontend Page | Component / Hook | User Action | Current Data Source | Required API | Method | Endpoint | Request | Response (data) | Auth | Authz | Loading | Error | Empty |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `/login` | `LoginForm` / `useLogin` | Submit credentials | **Mock** `auth.service.login` | Keycloak token (prod: Auth Code+PKCE) | POST | `{KC}/realms/devflow/protocol/openid-connect/token` | `grant_type`, `client_id=devflow-web`, code+PKCE (or tooling password grant via `devflow-frontend`) | `access_token`, `refresh_token`, `id_token`, `expires_in` | Public | — | Form pending | Invalid credentials toast | — |
| `/login` | same | Social login buttons | **Mock** `socialLogin` | Keycloak IdP brokers (if configured) | — | Keycloak auth URL | — | redirect | Public | — | — | — | Gap if brokers not configured |
| `/register` | Register form | Create account | **Mock** | Keycloak registration / Admin API | — | Keycloak | — | — | Public | — | Form | Validation | Gap — no Spring register API |
| `/forgot-password` | Form | Request reset | **Mock** | Keycloak account / reset flow | — | Keycloak | — | — | Public | — | Form | — | Gap |
| `/reset-password` | Form | Set new password | **Mock** | Keycloak | — | Keycloak | — | — | Public | — | Form | — | Gap |
| `/verify-email` | Form | Verify email | **Mock** | Keycloak email verify | — | Keycloak | — | — | Public | — | Form | — | Gap |
| Shell | `useSessionBootstrap` / `auth.service.getSession` | Bootstrap session | **Mock** sessionStorage | Auth + User | GET | `/api/auth/me` then `/api/users/me` | Bearer | JWT claims + local `UserResponse` | Bearer | Authenticated | Shell skeleton | 401 → login | Anonymous → `/login` |
| Shell | Logout | Sign out | **Mock** clear storage | Auth logout + Keycloak | POST | `/api/auth/logout` then redirect to `keycloakLogoutUrl` | Bearer; optional `idTokenHint` | `keycloakLogoutUrl` | Bearer | Authenticated | Button pending | Network toast | — |
| — | `getClientSession()` | Attach Bearer | **Stub always `null`** | Wire session with `accessToken` | — | — | — | — | — | — | — | Live APIs get 401 | — |
| Auth health | — | Probe | Partial via gateway | Auth | GET | `/api/auth/health` or `/api/v1/auth/health` | — | status map | Public | — | — | — | — |
| — | Status chip (if added) | Check auth | API ready | Auth | GET | `/api/auth/status` | optional Bearer | `authenticated`, `userId`, `roles` | Public | — | — | — | — |
| Account security | Admin ping (N/A in UI) | Role demo | API ready | Auth | GET | `/api/auth/admin/ping` | Bearer | `{scope,ok}` | Bearer | ADMIN / SUPER_ADMIN | — | 403 | — |

---

## 2. User profile & account

| Frontend Page | Component / Hook | User Action | Current Data Source | Required API | Method | Endpoint | Request | Response | Auth | Authz | Loading | Error | Empty |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `/profile` | Profile form / `updateProfile` | Load profile | **Mock** auth store | User | GET | `/api/users/me` or `/api/users/me/profile` | Bearer | `UserResponse` / `UserProfileResponse` | Bearer | Self | Skeleton | 401/404 | — |
| `/profile` | same | Save profile | **Mock** | User | PATCH | `/api/users/me` | `{firstName,lastName,displayName,avatarUrl,timezone,locale}` | `UserProfileResponse` | Bearer | Self | Submit pending | Validation | — |
| `/account/settings` | Preferences | Load prefs | **Mock** | User | GET | `/api/users/me/preferences` | Bearer | theme, notify flags | Bearer | Self | Skeleton | 401 | — |
| `/account/settings` | same | Save prefs | **Mock** | User | PATCH | `/api/users/me/preferences` | `{theme,notifyEmail,notifyInApp}` | same | Bearer | Self | Pending | Validation | — |
| `/account/notifications` | Notification prefs | Load/save | **Mock** auth.service | Partial overlap with user prefs; richer UI | PATCH | `/api/users/me/preferences` (limited) | notify flags only | prefs | Bearer | Self | Pending | — | Extra channels = **Gap** |
| `/account/security` | Password / 2FA / sessions / API keys | Manage security | **Mock** | Keycloak account + future | — | Keycloak / Gap | — | — | — | — | — | — | No Spring APIs for API keys/sessions |
| Profile | Lookup by id | View user | API ready (unused) | User | GET | `/api/users/{userId}` | Bearer | `UserResponse` | Bearer | Authenticated | — | 404 | — |
| Profile | By Keycloak sub | Resolve | API ready | User | GET | `/api/users/by-external-id/{sub}` | Bearer | `UserResponse` | Bearer | Authenticated | — | 404 | — |
| Profile | User orgs | List memberships | API ready | User | GET | `/api/users/{userId}/organizations` | Bearer | `PageResponse<{id,name,slug,role}>` | Bearer | Self or ADMIN | — | 403 | Empty page |

**Field mismatch (profile):** FE `language` / `dateFormat` / `phone` / `bio` / `name` vs BE `locale` / no dateFormat / no phone/bio; FE `role` (app UI role) ≠ BE user `status` enum.

---

## 3. Organizations, members, teams, invitations, roles

| Frontend Page | Component / Hook | User Action | Current Data Source | Required API | Method | Endpoint | Request | Response | Auth | Authz | Loading | Error | Empty |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `/organizations` | Org list | Load orgs | **Mock** `organization.service.list` | Org | GET | `/api/organizations?page&size` | Bearer | `PageResponse<OrganizationResponse>` | Bearer | Membership | List skeleton | 401 | EmptyState |
| `/organizations/new` | Create form | Create org | **Mock** | Org | POST | `/api/organizations` | `{name,slug,description?,logoUrl?}` | 201 org + OWNER | Bearer | Authenticated | Pending | 409 slug | — |
| `/organizations/[id]` | Detail | Load org | **Mock** | Org | GET | `/api/organizations/{id}` | Bearer | `OrganizationResponse` | Bearer | `organization.read` | Skeleton | 403/404 | — |
| same | Edit | Update | **Mock** | Org | PATCH | `/api/organizations/{id}` | `{name?,slug?,description?,logoUrl?,status?}` | org | Bearer | `organization.update` | Pending | Validation | — |
| same | Delete / leave | Soft delete / leave | **Mock** leave/delete | Org DELETE; leave **Gap** | DELETE | `/api/organizations/{id}` | — | ARCHIVED | Bearer | `organization.delete` | Modal | 403 | — |
| `/settings/organization` | Branding / settings | Update branding | **Mock** `updateBranding` | Partial: logo via PATCH org; industry/timezone/branding extras | PATCH | `/api/organizations/{id}` | logoUrl | org | Bearer | update | Pending | — | Extra branding fields = **Gap** |
| `/settings/members` | Member table | List members | **Mock** `member.service` | Org | GET | `/api/organizations/{id}/members?page&size` | Bearer | `PageResponse<MembershipResponse>` | Bearer | `organization.read` | Table loading | 403 | Empty members |
| same | Invite | Send invite | **Mock** | Org | POST | `/api/organizations/{id}/invitations` | `{email,roleCode,expiresInDays}` | 201 + **token once** | Bearer | `manage_members` | Pending | Validation | — |
| same | List invites | Pending invites | **Mock** | Org | GET | `/api/organizations/{id}/invitations` | Bearer | page (`token:null`) | Bearer | manage_members | — | — | Empty |
| same | Resend invite | Resend | **Mock** | **Gap** — no resend API | — | — | — | — | — | — | — | — | Recommend: recreate invite |
| same | Revoke invite | Cancel | **Mock** | Org | DELETE | `/api/invitations/{invitationId}` | — | 204 | Bearer | manage_members | Pending | 404 | — |
| Invite accept (UI?) | Accept flow | Accept | **Mock** / missing route | Org | POST | `/api/invitations/{rawToken}/accept` | Bearer; email match | `MembershipResponse` | Bearer | Invitee | Pending | 403 email | — |
| same | Change role | PATCH role | **Mock** | Org | PATCH | `.../members/{userId}` | `{roleCode?,status?}` | membership | Bearer | manage_members | Pending | 403 | — |
| same | Remove member | Remove | **Mock** | Org | DELETE | `.../members/{userId}` | — | 204 | Bearer | manage_members | Pending | 403 | — |
| `/organizations/[id]/teams` | Teams | List/create/update/delete | **Mock** | Org | CRUD | `/api/organizations/{id}/teams`, `/api/teams/{id}` | see contract | `TeamResponse` | Bearer | team.* | — | 403 | Empty teams |
| same | Team members | Assign | **Mock** | Org | POST/DELETE | `/api/teams/{id}/members` | `{userId,role}` | team membership | Bearer | `team.manage_members` | — | Must be org member | Empty |
| `/settings/roles` | Roles / permission matrix | List roles / save matrix | Live | Org | GET/PUT | `.../permission-matrix`, `.../roles`, `.../permissions` | Bearer | matrix DTO | Bearer | GET: org read; PUT: `role.manage` | — | 400 unknown codes | Overrides stored in `organization_role_permissions` |
| Org stats / activity / audit | Widgets | View | **Mock** | Partial audit stub / **Gap** stats | GET | future | — | — | — | — | — | — | Out of scope |

**Enum mismatches (org):**  
FE roles `owner|admin|manager|developer|viewer` vs BE `OWNER|ADMIN|MEMBER|GUEST`.  
FE member status `active|invited|suspended` vs BE membership `ACTIVE|INACTIVE` + invitation statuses.  
FE org fields `industry`, `timezone`, `language`, `dateFormat`, storage metrics — **not on** `OrganizationResponse`.

---

## 4. Projects (Phase 4 — partial live path)

Flag: `NEXT_PUBLIC_USE_PROJECT_API=true` + browser must reach gateway (see plan §12).  
Default without flag: **Mock**.

| Frontend Page | Component / Hook | User Action | Current Data Source | Required API | Method | Endpoint | Request | Response | Auth | Authz | Loading | Error | Empty |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `/projects` | `ProjectListView` / `useProjects` | Load list | Mock / **Partial API** | Project | GET | `/api/projects` | query: `organizationId,status,health,visibility,search,tag,favorite,page,size,sort` | `PageResponse<ProjectSummaryResponse>` | Bearer | visibility rules | List skeleton | 401/403 | `ProjectEmptyState` |
| same | Search / filters / sort | Filter | Mock / Partial | Project | GET | same | mapped enums | page | Bearer | — | Refetch | — | Empty filtered |
| same | Favorite button | Toggle | Mock / Partial | Project | POST or DELETE | `/api/projects/{id}/favorite` | — | 201 / 204 | Bearer | `project.read` | Optimistic | 403 | — |
| same | Archive modal | Archive | Mock / Partial | Project | POST | `/api/projects/{id}/archive` | — | project | Bearer | `project.archive` | Modal | 403 | — |
| `/projects/new` | `ProjectForm` | Create | Mock / Partial | Project | POST | `/api/projects` | `{organizationId,name,description?,key,icon?,status?,visibility?}` | 201 detail | Bearer | org `project.create` | Pending | 409 key | — |
| `/projects/[id]` | Detail shell | Load | Mock / Partial | Project | GET | `/api/projects/{id}` | — | `ProjectDetailResponse` | Bearer | `project.read` | Skeleton | 404 → not found | — |
| `/projects/[id]/edit` | Form | Update | Mock / Partial | Project | PATCH | `/api/projects/{id}` | name, description, icon, status, health, visibility | project | Bearer | `project.update` | Pending | Validation | — |
| settings | Status / health controls | Patch only | Partial (may use general PATCH) | Project | PATCH | `.../status`, `.../health` | `{status}` / `{health}` | project | Bearer | update | Pending | 400 | — |
| `/projects/[id]/settings` | Settings form | Save settings | Mock / Partial | Project | PATCH | `/api/projects/{id}/settings` | visibility flags, timezone, defaultProjectView | settings | Bearer | manage_settings | Pending | — | Extra FE fields ignored |
| settings | Tags | CRUD tags | Mock / unused live | Project | GET/POST/PATCH/DELETE | `.../tags` | `{name,color}` | tags | Bearer | manage_tags | — | Validation color | Empty tags |
| `/projects/[id]/members` | Members | List/add/change/remove | **Mock** (live detail shells empty members) | Project | GET/POST/PATCH/DELETE | `.../members` | `{userId,role}` | members page | Bearer | read / manage_members | Table | 403 | Empty members |
| activity page | Activity feed | Load | **Mock** / API ready unused | Project | GET | `.../activity?page&size` | optional `activityType` | page | Bearer | `view_activity` | — | 403 guest | Empty feed |
| favorites | Favorites list | Load | Partial via list `favorite=true` | Project | GET | `/api/projects/favorites` | page,size | summaries | Bearer | auth | — | — | Empty |
| Transfer modal | Transfer ownership | Transfer | Mock / Partial | Project | POST | `.../ownership/transfer` | `{newOwnerUserId}` (**not** memberId) | project | Bearer | OWNER/manage | Modal | 400/403 | — |
| Duplicate modal | Duplicate | Copy | Mock / client `create` | **Gap** dedicated API | POST | `/api/projects` (workaround) | copied fields | 201 | Bearer | create | — | — | Recommend keep client create |
| Delete modal | Delete | Soft delete | Mock / Partial | Project | DELETE | `/api/projects/{id}` | — | archived response | Bearer | `project.delete` | Confirm key | 403 | — |
| Restore | Restore archived | Restore | API ready; UI weak | Project | POST | `.../restore` | — | ACTIVE | Bearer | archive | — | 403 | — |
| Import/Export buttons | Toast only | Import/export | **Gap** | — | — | — | — | — | — | — | — | — | No API |
| Sub-routes: tasks, board, backlog, sprints, docs, repo, analytics, environments, releases, reports | Feature tabs | Navigate | **Mock** / future services | task/sprint/doc/repo/analytics stubs | — | future `/api/tasks` etc. | — | — | — | — | — | — | Out of Phase 4 |

**Enum mapping (already in `project-api.mappers.ts` when flag on):**

| UI | Backend |
|---|---|
| `planning/active/paused/completed/archived` | `PLANNING/ACTIVE/ON_HOLD/COMPLETED/ARCHIVED` |
| `healthy/at_risk/critical/unknown` | `HEALTHY/AT_RISK/CRITICAL/UNKNOWN` |
| `private/internal/public` | `PRIVATE` / ≈`TEAM` or private / `ORGANIZATION` (lossy) |

---

## 5. Dashboard, tasks, sprints, repositories, documents, monitoring, notifications

| Frontend Area | Current Data Source | Backend today | Integration stance |
|---|---|---|---|
| `/`, `/home`, `/dashboard` | **Mock** `dashboard.service` | analytics-service stub only | Defer; keep mock |
| `/tasks/**` | **Mock** | task-service health stub | Defer |
| `/sprints/**` | **Mock** | sprint-service stub | Defer |
| `/repositories/**` | **Mock** | repository-service stub | Defer |
| `/documents/**` | **Mock** | document-service stub | Defer |
| `/monitoring/**`, audit UI | **Mock** | audit/analytics stubs | Defer |
| Shell notifications | **Sample data** | notification-service stub | Defer; optional later `/api/notifications` |

For each deferred area: Loading/Error/Empty already exist in UI against TanStack Query mocks — **do not invent duplicate APIs**; wait for owning microservice.

---

## 6. Cross-cutting: pagination, errors, dates

| Concern | Frontend | Backend | Mismatch / note |
|---|---|---|---|
| Pagination request | Often client-side; live projects hardcode `page:0`,`size:50` | Query `page` (0-based), `size` | Wire FE `page`/`pageSize` → `page`/`size` |
| Pagination response | `PaginatedResult.total` | `PageResponse.totalElements` | Map `totalElements` → `total` |
| Errors | `ApiError` + domain errors; envelope `error.code/message` | `ApiResponse.error` + HTTP status; some **204** empty | Handled in `apiClient`; map 403→permission UI |
| Dates | ISO strings in mocks | Instant ISO-8601 JSON | Compatible if kept as strings |
| Auth header | Bearer from `getClientSession` | Gateway JWT resource server | **Broken until session wired** |
| Correlation | Not sent by FE | Gateway generates `X-Correlation-Id` | Optional: FE generate/send for support |

---

## 7. Unused / underused backend endpoints (relative to current UI)

| Endpoint | Owner | Frontend status |
|---|---|---|
| `GET /api/auth/status`, `GET /api/auth/me`, `POST /api/auth/logout` | auth | Unused (mock auth) |
| All `/api/users/**` | user | Unused |
| All `/api/organizations/**`, teams, invitations | org | Unused |
| `GET/PATCH .../projects/{id}/settings`, tags CRUD, members CRUD, activity, favorites list, status/health PATCH, summary | project | Partially unused even when project API flag on |
| Task/sprint/doc/repo/… domain APIs | stubs | N/A |

---

## 8. Smallest-fix recommendations (report only)

| # | Problem | Smallest fix (do not implement in F1) |
|---|---|---|
| 1 | No Bearer token | Implement `getClientSession()` + Keycloak PKCE; store access/refresh securely |
| 2 | Browser `apiClient` uses relative `/api` | Set absolute `NEXT_PUBLIC_API_BASE_URL` in browser build **or** Next rewrite proxy to `:8080` |
| 3 | Mock auth ≠ Keycloak users | Replace login with Keycloak redirect; map `/api/users/me` into auth store |
| 4 | Org/user still mock | Add `organization-api.service` / `user-api.service` behind flags (mirror project pattern) |
| 5 | Enum / field mismatches | Keep UI types; expand mappers (do not change backend enums) |
| 6 | Transfer `memberId` vs `newOwnerUserId` | Pass app `userId` from member row |
| 7 | FE org/project fields without BE columns | Ignore in mapper or disable UI fields until owned |
| 8 | Permission matrix save | Read-only against BE roles/permissions until product decides |
| 9 | Invite resend | Recreate invitation (delete+create) or add BE later |
| 10 | Duplicate project | Keep client-side create copy; no new BE endpoint required for MVP |
