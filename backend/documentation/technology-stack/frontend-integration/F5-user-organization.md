# F5 — User & Organization Frontend ↔ Backend Integration

**Phase:** F5  
**Depends on:** F2 API client, F3 authentication  
**Contracts:** [user-api-contract.md](../../api/user-api-contract.md), [organization-api-contract.md](../../api/organization-api-contract.md), [membership-api-contract.md](../../api/membership-api-contract.md), [invitation-api-contract.md](../../api/invitation-api-contract.md)

---

## Summary

User profile/preferences and Organization (orgs, members, invitations, teams) screens use Gateway APIs through existing `userApi` / `organizationApi` clients plus feature adapters. In-memory mocks remain when flags are `false` or no API base URL is configured. UI, colors, spacing, and typography are unchanged.

---

## Data flow

```
Page / Component
  → TanStack Query hook
  → authService / organizationService / memberService (Proxy)
      → *ApiService (live) | mock
        → userApi / organizationApi → Gateway :8080
        → mappers (UI ↔ backend DTOs / roles)
```

Bearer token comes from F3 `getClientSession()` via `apiClient`.

---

## When live APIs are used

| Flag | Behavior |
|---|---|
| `NEXT_PUBLIC_USE_USER_API=false` | Mock profile/prefs/search |
| `NEXT_PUBLIC_USE_USER_API=true` | Live user-service |
| unset | Live if `NEXT_PUBLIC_API_URL` / `NEXT_PUBLIC_API_BASE_URL` set |
| `NEXT_PUBLIC_USE_ORGANIZATION_API` | Same pattern for org/members/teams |

---

## User Service integration

| UI action | Hook / service | HTTP |
|---|---|---|
| Current user (session) | OIDC bootstrap (F3) | `GET /api/users/me` (+ `/api/auth/me`) |
| Profile update | `useUpdateProfile` → `userApiService` | `PATCH /api/users/me` |
| Preferences (theme/locale/tz) | `useUpdatePreferences` | `PATCH .../preferences` + profile locale/tz |
| Notification prefs | `useUpdateNotificationPreferences` | `PATCH .../preferences` (`notifyEmail` / `notifyInApp`) |
| User by id | `userApiService.getById` | `GET /api/users/{id}` |
| User search (invite) | `useUserSearch` | Org members + `GET /api/users/{id}` hydrate; UUID direct lookup |

**No dedicated user list/search endpoint exists.** Search uses organization membership as the candidate pool and hydrates display fields from User Service. Do not invent local users.

---

## Organization Service integration

| UI action | Service | HTTP |
|---|---|---|
| List / detail / create / update / delete | `organizationApiService` | `GET/POST/PATCH/DELETE /api/organizations` |
| Branding | logo via `PATCH` org; colors kept in UI model only | `PATCH /api/organizations/{id}` |
| Members list / role / remove | `memberApiService` | members CRUD |
| Invite | email invitation | `POST .../invitations` |
| Resend | revoke + recreate | delete invite + create |
| Teams | team CRUD + members | `/api/organizations/{id}/teams`, `/api/teams/**` |
| Ownership transfer | promote target to `OWNER`, demote actor to `ADMIN` | `PATCH .../members/{userId}` |
| Leave | remove self membership | `DELETE .../members/{userId}` |
| Roles / permission matrix | GET/PUT org matrix mapped to UI grid | persisted per org in `organization_role_permissions` |
| Activity / audit | empty arrays (no BE yet) | — |

### Role mapping

| Backend | UI |
|---|---|
| `OWNER` | `owner` |
| `ADMIN` | `admin` |
| `MEMBER` | `developer` (`manager` writes as `MEMBER`) |
| `GUEST` | `viewer` |

Frontend role checks remain UX-only; Gateway + org RBAC enforce authorization.

---

## Organization context

- Zustand `useOrganizationStore` holds `currentOrganizationId` (persisted) and a lightweight list for the switcher.
- `useOrganizations` refreshes the list from the API and calls `setOrganizations`.
- `AuthenticatedShell` prefers session org id, then first listed org, when switching/hydrating.
- Do not duplicate a second org context store.

---

## Project member invitation

`InviteProjectMemberModal` on the project members page:

1. Debounced `useUserSearch` against current org + User Service  
2. `useAddProjectMember` → project API `POST .../members` with real `userId`

---

## State management

- **TanStack Query** — org list/detail/members/teams/invitations, user search  
- **Zustand** — auth principal + current org chrome  
- Reuses F2 clients; no new HTTP libraries

---

## Loading / errors / empty

- Existing skeletons, toasts, empty states preserved  
- Mapped statuses: 401, 403, 404, 409, 422/400, 500, network  
- Favorites-style optimistic updates are **not** used for ownership / member role changes

---

## Code-level locations

| Path | Role |
|---|---|
| `lib/api/services/user.api.ts` | Typed user Gateway client |
| `lib/api/services/organization.api.ts` | Typed org/team/invite client |
| `features/auth/services/user-api.service.ts` | Profile/prefs/search adapter |
| `features/auth/services/user-api.mappers.ts` | User DTO ↔ auth UI |
| `features/organization/services/organization-api.service.ts` | Org adapter |
| `features/organization/services/member-api.service.ts` | Members/invites/teams |
| `features/organization/services/organization-api.mappers.ts` | Org DTO ↔ UI |
| `features/projects/components/invite-project-member-modal.tsx` | Project invite + user search |

---

## Known limitations

- No global user directory/search API — search is org-member scoped (+ UUID lookup)  
- Org branding colors, industry, storage meters, activity, and audit logs are not fully backed by Phase 3 APIs  
- Custom role duplication is not supported; the permission matrix is persisted per organization  
- Invite `teamId` / `message` fields are UI-only for live invitations  
- Sessions, password change, 2FA, API keys remain mock / IdP-owned (Keycloak)  
- Shell project switcher still uses layout sample projects (not org/project APIs)  
