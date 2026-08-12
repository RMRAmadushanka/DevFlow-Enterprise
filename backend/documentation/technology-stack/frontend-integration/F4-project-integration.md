# F4 — Project Management Frontend ↔ Backend Integration

**Phase:** F4  
**Depends on:** F2 API client, F3 authentication  
**Contracts:** [project-api-contract.md](../../api/project-api-contract.md), [backend-integration-map.md](../../frontend/backend-integration-map.md)

---

## Summary

Project screens use the Gateway **project-service** APIs through `projectApi` + `projectApiService` mappers.  
In-memory mock remains only when `NEXT_PUBLIC_USE_PROJECT_API=false` or no API base URL is configured. Storybook/unit fixtures are unchanged.

---

## Data flow

```
Page / Component
  → TanStack Query hook (useProjects / useProject / …)
    → projectService (Proxy)
      → projectApiService (live) | mockProjectService
        → projectApi (lib/api) → Gateway :8080 → project-service
        → mappers (UI ↔ PROJECT_* enums)
```

Bearer token comes from F3 `getClientSession()` via `apiClient`.

---

## When live API is used

`isProjectApiEnabled()`:

1. `NEXT_PUBLIC_USE_PROJECT_API=false` → mock  
2. `=true` → live  
3. unset → live if `NEXT_PUBLIC_API_URL` or `NEXT_PUBLIC_API_BASE_URL` is set  

---

## API connections

| UI action | Hook / service | HTTP |
|---|---|---|
| List + search/filter/sort | `useProjects` → `list` | `GET /api/projects` |
| Detail header/overview | `useProject` → `getById` (+ hydrate) | `GET /api/projects/{id}` + members/activity/settings |
| Create | `useCreateProject` | `POST /api/projects` (+ tags/settings) |
| Edit / settings save | `useUpdateProject` | `PATCH /api/projects/{id}` + `PATCH .../settings` + tag sync |
| Status | `useUpdateProjectStatus` | `PATCH .../status` |
| Health | `useUpdateProjectHealth` | `PATCH .../health` |
| Archive / restore / delete | archive/restore/delete hooks | `POST .../archive`, `.../restore`, `DELETE` |
| Favorite | `useToggleFavorite` (optimistic) | `POST` / `DELETE .../favorite` |
| Members page | `useProjectMembers` | `GET .../members` |
| Activity page | `useProjectActivity` | `GET .../activity` |
| Transfer ownership | `useTransferProjectOwnership` | `POST .../ownership/transfer` `{ newOwnerUserId }` |
| Tags | sync on settings save | tag CRUD |

---

## Component integration (UI preserved)

| Component / page | Change |
|---|---|
| List / form / settings / modals | Still use hooks; service now hits API |
| Members page | Loads `useProjectMembers` (loading + empty states) |
| Activity page | Loads `useProjectActivity` |
| Transfer modal | Select value = `userId` |
| Project search | Debounced `onSearch` (300ms) |

No design-system / CSS changes.

---

## State management

- **TanStack Query** for server state (lists, detail, members, activity)  
- **Zustand** `useProjectStore` for filters / sort / viewMode only  
- Query keys: `projectKeys.*` including `members` / `activity`  

---

## Authentication / authorization

- All live calls require Bearer (F3)  
- 401/403 mapped to `ProjectPermissionError`  
- UI `PermissionGuard` / role badges are UX-only; Gateway + project RBAC enforce access  
- Backend roles `PROJECT_*` mapped to existing badge roles (`owner`…`viewer`) for display  

---

## Loading / errors / empty

- Existing skeletons, toasts, `ProjectEmptyState` variants  
- Favorites use safe optimistic toggle with rollback  
- Archive / delete / transfer are **not** optimistic  

---

## Pagination / search

- List query: `page`, `size` (default 0/50), `search`, `status`, `visibility`, `favorite`, `sort`, `organizationId`  
- Search debounced 300ms before store update → query refetch  
- Client-side technology/language filters are not sent (no backend fields)  

---

## Code-level locations

| Path | Role |
|---|---|
| `lib/api/services/project.api.ts` | Typed Gateway client |
| `features/projects/services/project-api.service.ts` | UI adapter + hydration |
| `features/projects/services/project-api.mappers.ts` | Enum / DTO mapping |
| `features/projects/services/project.service.ts` | Proxy mock ↔ live |
| `features/projects/hooks/use-projects.ts` | Query/mutation hooks |
| `app/(dashboard)/projects/**` | Pages |

---

## Known limitations

- Analytics / repository / environments / milestones remain empty shells (no Phase 4 APIs)  
- Duplicate project = client-side create copy (no dedicated BE endpoint)  
- Member invite UI button has no create-member modal wired yet (APIs + hooks exist)  
- List pagination UI controls not added (first page size 50)  
- Health filter not in list filter bar (status/visibility/favorite/search only)  
