# Frontend Project Feature → API Mapping — Phase 4

Maps **existing** Project UI under `frontend/src/app/(dashboard)/projects` and `frontend/src/features/projects` to Phase 4 **project-service** APIs.

**Note:** By default the frontend uses an in-memory mock (`features/projects/services/project.service.ts`). Set `NEXT_PUBLIC_USE_PROJECT_API=true` (and `NEXT_PUBLIC_API_BASE_URL=http://localhost:8080`) to route through `project-api.service.ts` + enum mappers (`project-api.mappers.ts`) to Phase 4 project-service. Columns below show the **target** Phase 4 backend mapping. Gaps and enum mismatches are called out explicitly.

**Structure:** Frontend Page → Component → User Action → API → Backend Service → Database → Kafka Event

Gateway base: `http://localhost:8080` · Service: `project-service` (`:8084`) · Topic: `project-events` (via transactional outbox)

---

## Projects list

| Frontend Page | Component | User Action | API | Backend Service | Database | Kafka Event |
|---|---|---|---|---|---|---|
| `app/(dashboard)/projects/page.tsx` | `ProjectListView` → `useProjects` | Load list (org-scoped filters/sort) | `GET /api/projects?organizationId&status&search&favorite&page&size&sort` | `ProjectService.list` | `projects`, `project_members`, `project_tags`, `project_favorites` | — |
| same | `ProjectSearch` | Search by name/key/description | `GET /api/projects?search=` | `ProjectService.list` | `projects` | — |
| same | `ProjectFilters` | Filter status / visibility / favorites / archived | `GET /api/projects?status=&visibility=&favorite=` (+ `status=ARCHIVED` for archived) | `ProjectService.list` | `projects`, `project_favorites` | — |
| same | `ProjectSort` | Sort list | `GET /api/projects?sort=name,asc` (whitelist fields) | `ProjectService.list` / `PageSupport.parseSort` | `projects` | — |
| same | `ProjectGrid` / `ProjectTable` / `ProjectCard` | Open project | `GET /api/projects/{projectId}` (on detail navigation) | `ProjectService.get` | `projects` | — |
| same | `FavoriteProjectButton` | Toggle favorite from card | `POST` / `DELETE /api/projects/{id}/favorite` | `ProjectFavoriteService` | `project_favorites` | `PROJECT_FAVORITED` / `PROJECT_UNFAVORITED` |
| same | `ProjectArchiveModal` | Archive from list actions | `POST /api/projects/{id}/archive` | `ProjectService.archive` | `projects` | `PROJECT_ARCHIVED` |
| same | Create button → `/projects/new` | Navigate to create | — | — | — | — |
| same | Import / Export buttons | Toast-only (no API today) | **Gap** — no import/export API in Phase 4 | — | — | — |

**Frontend ↔ backend filter notes**

- UI `archived` filter → backend `status=ARCHIVED` (no `archived` query param).
- UI visibility `private` / `internal` / `public` ≠ backend `PRIVATE` / `ORGANIZATION` / `TEAM` — client mapping required.
- UI status values (`active`, `paused`, …) ≠ backend enums (`ACTIVE`, `ON_HOLD`, …) — client mapping required.

---

## Create project

| Frontend Page | Component | User Action | API | Backend Service | Database | Kafka Event |
|---|---|---|---|---|---|---|
| `app/(dashboard)/projects/new/page.tsx` | `ProjectForm` (`mode="create"`) + `useCreateProject` | Submit create form | `POST /api/projects` body includes `"key"` | `ProjectService.create` | `projects`, `project_members` (OWNER), `project_settings`, `project_activity`, `outbox_events` | `PROJECT_CREATED` |

Create body fields supported by backend: `organizationId`, `name`, `description`, `key`, `icon`, `status`, `visibility`. Frontend also collects `teamId`, `repositoryUrl`, `technologyStack`, `color`, etc. — **not persisted by Phase 4 project-service** (gap / future services).

---

## Project detail (overview / hero / header)

| Frontend Page | Component | User Action | API | Backend Service | Database | Kafka Event |
|---|---|---|---|---|---|---|
| `app/(dashboard)/projects/[projectId]/page.tsx` | `ProjectDetailShell` → `useProject` | Load detail | `GET /api/projects/{projectId}` | `ProjectService.get` | `projects`, members count, tags, favorites | — |
| same | `ProjectHeader` / `ProjectHero` (via shell) | View name, key, status, health, visibility | same GET detail | `ProjectService.get` | `projects` | — |
| same | `FavoriteProjectButton` | Favorite / unfavorite | `POST` / `DELETE .../favorite` | `ProjectFavoriteService` | `project_favorites` | `PROJECT_FAVORITED` / `PROJECT_UNFAVORITED` |
| same | `ProjectOverview` → `ProjectStatistics` | View task/sprint/deploy stats | **Out of Phase 4** — mock-only; no project analytics API | future analytics/task services | — | — |
| same | `ProjectOverview` → `ProjectMilestones` | View milestones | **Out of Phase 4** | future | — | — |
| same | `ProjectOverview` → `ProjectRepositoryCard` | View repo card | **Out of Phase 4** | future repository-service | — | — |
| same | `ProjectOverview` → `ProjectActivity` (snippet) | Recent activity | `GET /api/projects/{id}/activity` | `ProjectActivityService` | `project_activity` | — |
| same | `ProjectQuickActions` | Archive / Duplicate shortcuts | archive → `POST .../archive`; duplicate → see gap | `ProjectService.archive` | `projects` | `PROJECT_ARCHIVED` |

Optional summary endpoint for lighter cards: `GET /api/projects/{projectId}/summary`.

---

## Edit project

| Frontend Page | Component | User Action | API | Backend Service | Database | Kafka Event |
|---|---|---|---|---|---|---|
| `app/(dashboard)/projects/[projectId]/edit/page.tsx` | `ProjectForm` (`mode="edit"`) + `useUpdateProject` | Save edits | `PATCH /api/projects/{projectId}` | `ProjectService.update` | `projects`, `project_activity`, `outbox_events` | `PROJECT_UPDATED` |
| same / settings | Status-only control (when wired) | Change status | `PATCH /api/projects/{projectId}/status` | `ProjectService.updateStatus` | `projects`, activity, outbox | `PROJECT_STATUS_CHANGED` |
| same / settings | Health-only control (when wired) | Change health | `PATCH /api/projects/{projectId}/health` | `ProjectService.updateHealth` | `projects`, activity, outbox | `PROJECT_HEALTH_CHANGED` |

Backend update allows: `name`, `description`, `icon`, `status`, `health`, `visibility`. Dedicated status/health PATCH endpoints exist for UI controls that change only those fields (distinct events). Frontend may send `key`, `repositoryUrl`, `tags`, `color`, etc. — **key is immutable** server-side; repo/color/tags need separate APIs (`tags` → tag endpoints) or are future gaps.

---

## Project settings (+ danger zone)

| Frontend Page | Component | User Action | API | Backend Service | Database | Kafka Event |
|---|---|---|---|---|---|---|
| `app/(dashboard)/projects/[projectId]/settings/page.tsx` | `ProjectSettingsForm` + `useUpdateProject` | Save settings form (name/visibility/status/timezone/repo/tags) | Partial: `PATCH /api/projects/{id}` for name/description/visibility/status; timezone/default view → `PATCH /api/projects/{id}/settings`; tags → tag APIs | `ProjectService` / `ProjectSettingsService` / `ProjectTagService` | `projects`, `project_settings`, `project_tags` | `PROJECT_UPDATED` / `PROJECT_SETTINGS_UPDATED` / tag events |
| same | Danger zone → `ProjectArchiveModal` | Archive | `POST /api/projects/{id}/archive` | `ProjectService.archive` | `projects` | `PROJECT_ARCHIVED` |
| same | Danger zone → `TransferOwnershipModal` | Transfer ownership | `POST /api/projects/{id}/ownership/transfer` `{ "newOwnerUserId" }` | `ProjectService.transferOwnership` | `project_members` | `PROJECT_OWNERSHIP_TRANSFERRED` |
| same | Danger zone → `DeleteProjectModal` | Confirm delete (types project key) | `DELETE /api/projects/{id}` (soft archive) | `ProjectService.delete` | `projects` | **`PROJECT_DELETED`** |

**UI ↔ API gaps on settings**

- Dedicated `GET/PATCH .../settings` exists; UI currently folds settings into `projectService.update` mock.
- Transfer UI selects `memberId`; backend expects **`newOwnerUserId`** (application user UUID).
- Delete UI confirms with project key client-side only; backend does not require confirmation body.

---

## Project members

| Frontend Page | Component | User Action | API | Backend Service | Database | Kafka Event |
|---|---|---|---|---|---|---|
| `app/(dashboard)/projects/[projectId]/members/page.tsx` | `ProjectMembers` (data from detail mock `project.members`) | View members | `GET /api/projects/{id}/members` | `ProjectMemberService.list` | `project_members` | — |
| same | (future wired actions) | Add member | `POST /api/projects/{id}/members` | `ProjectMemberService.add` | `project_members` | `PROJECT_MEMBER_ADDED` |
| same | (future wired actions) | Change role/status | `PATCH /api/projects/{id}/members/{userId}` | `ProjectMemberService.update` | `project_members` | `PROJECT_MEMBER_ROLE_CHANGED` |
| same | (future wired actions) | Remove member | `DELETE /api/projects/{id}/members/{userId}` | `ProjectMemberService.remove` | `project_members` | `PROJECT_MEMBER_REMOVED` |

Today the page renders members embedded in mock `getById`; Phase 4 list endpoint is the correct integration path.

---

## Project activity

| Frontend Page | Component | User Action | API | Backend Service | Database | Kafka Event |
|---|---|---|---|---|---|---|
| `app/(dashboard)/projects/[projectId]/activity/page.tsx` | `ProjectTimeline` (from mock `project.activity`) | View activity feed | `GET /api/projects/{id}/activity?activityType&page&size` | `ProjectActivityService.list` | `project_activity` | — (read only; writes happen on domain mutations) |

Requires `project.view_activity` (GUEST cannot view).

---

## Favorite button

| Frontend Page | Component | User Action | API | Backend Service | Database | Kafka Event |
|---|---|---|---|---|---|---|
| List / detail shell | `FavoriteProjectButton` + `useToggleFavorite` | Toggle star | If not favorited: `POST /api/projects/{id}/favorite`; if favorited: `DELETE /api/projects/{id}/favorite` | `ProjectFavoriteService` | `project_favorites` | `PROJECT_FAVORITED` / `PROJECT_UNFAVORITED` |
| — | Favorites-only list (filter or dedicated) | List favorites | `GET /api/projects/favorites` **or** `GET /api/projects?favorite=true` | `ProjectFavoriteService` / `ProjectService.list` | `project_favorites`, `projects` | — |

---

## Archive / restore / delete / transfer modals

| Frontend Page | Component | User Action | API | Backend Service | Database | Kafka Event |
|---|---|---|---|---|---|---|
| List / settings | `ProjectArchiveModal` + `useArchiveProject` | Confirm archive | `POST /api/projects/{id}/archive` | `ProjectService.archive` | `projects` | `PROJECT_ARCHIVED` |
| — | *(no dedicated restore modal in UI)* | Restore archived | `POST /api/projects/{id}/restore` | `ProjectService.restore` | `projects` | `PROJECT_RESTORED` |
| Settings | `DeleteProjectModal` + `useDeleteProject` | Confirm delete | `DELETE /api/projects/{id}` | `ProjectService.delete` | `projects` (soft) | `PROJECT_DELETED` |
| Settings | `TransferOwnershipModal` + `useTransferProjectOwnership` | Confirm transfer | `POST /api/projects/{id}/ownership/transfer` | `ProjectService.transferOwnership` | `project_members` | `PROJECT_OWNERSHIP_TRANSFERRED` |

Mock `projectService.restore` exists but **no restore hook/modal** is wired in the app routes yet → frontend gap; backend API ready.

---

## Duplicate project modal — Phase 4 gap

| Frontend Page | Component | User Action | API | Backend Service | Database | Kafka Event |
|---|---|---|---|---|---|---|
| List (`ProjectListView`) | `DuplicateProjectModal` + `useDuplicateProject` | Duplicate with new name/key | **No backend duplicate API in Phase 4** | — | — | — |

Mock currently clones via `projectService.create`. **Documented gap / future:** either `POST /api/projects/{id}/duplicate` or client-driven `POST /api/projects` with copied fields (settings/tags/members not auto-copied unless implemented).

---

## Out of Phase 4 scope (future services)

These pages exist under `app/(dashboard)/projects/[projectId]/…` and use mock detail fields. They are **not** implemented by project-service Phase 4.

| Frontend Page | UI feature | Phase 4 status |
|---|---|---|
| `.../analytics/page.tsx` | `ProjectAnalyticsView` | Future analytics-service |
| `.../repository/page.tsx` | Repository details | Future repository-service |
| `.../environments/page.tsx` | Environments | Future deployment-service |
| `.../tasks/page.tsx` | Tasks | Future task-service |
| `.../board/page.tsx` | Board | Future task-service |
| `.../backlog/page.tsx` | Backlog | Future task-service |
| `.../sprints/page.tsx` | Sprints | Future sprint-service |
| `.../documents/page.tsx` | Documents | Future document-service |
| `.../releases/page.tsx` | Releases | Future deployment/release |
| `.../reports/page.tsx` | Reports | Future analytics |

Detail shell may still call `GET /api/projects/{id}` for header chrome; domain widgets remain future.

---

## Integration checklist (frontend → backend)

1. Replace mock `project.service.ts` with real HTTP client to gateway `/api/projects/**`.
2. Map enum/visibility/status differences.
3. Send create `"key"`; read response `"key"` (not `projectKey`).
4. Wire favorites as POST/DELETE (not a single toggle endpoint).
5. Wire members/settings/activity/tags to dedicated endpoints.
6. Map transfer `newOwnerUserId` from selected member’s `userId`.
7. Treat DELETE as soft archive (`PROJECT_DELETED`); keep archive modal on `POST .../archive`.
8. Leave duplicate as gap until a dedicated API or create-with-copy flow is approved.
