# Organization & Team Management

Frontend feature module for multi-tenant organization switching, members,
roles, teams, and organization settings in DevFlow Enterprise.

**Scope.** UI + mock services only — no real backend.

## Architecture

```
Page (app/(dashboard)/organizations | settings/*)
  → Feature components
    → Hooks (TanStack Query)
      → organization.service.ts / member.service.ts
      → useOrganizationStore (current org chrome)
```

Permissions reuse `@/lib/permissions` (`PermissionProvider`, `PermissionGuard`).
Do not recreate role ladders inside the feature.

## Routes

| Route | Purpose |
|-------|---------|
| `/organizations` | List organizations |
| `/organizations/new` | Create organization |
| `/organizations/:id` | Detail (overview, members, teams, settings, audit) |
| `/organizations/:id/teams` | Team management |
| `/settings/organization` | General, branding, danger zone |
| `/settings/members` | Member table + invite |
| `/settings/roles` | Role cards + permission matrix |

Typed hrefs: `@/config/routes` (`routes.app.organizations`, `organization(id)`, …).

## Folder

```
src/features/organization/
  components/   # cards, tables, forms, switcher, matrix, shells
  hooks/
  services/
  schemas/
  types/
  store/organization.store.ts
  constants/
  utils/
  index.ts
```

## State management

| Concern | Tool |
|---------|------|
| Current organization + switcher open | Zustand `useOrganizationStore` |
| Lists / detail / members / teams / roles | TanStack Query |
| Form drafts | React Hook Form + Zod |

Zustand stores only chrome selection — not full server payloads.

## Permission model

Extended permissions include:

- `organization.read|create|update|delete`
- `member.invite|remove|update`
- `role.manage`
- `team.manage`
- legacy `org.manage`

Default role matrix lives in `src/lib/permissions/permissions.ts`.

## User flows

1. **Switch organization** — sidebar `OrganizationSwitcher` → updates store → navigates to org detail.
2. **Create organization** — `/organizations/new` → mock create → switch + redirect to detail.
3. **Invite member** — settings/members or detail → `InviteMemberModal` → toast on success.
4. **Manage roles** — settings/roles → role cards + editable permission matrix → Save.
5. **Teams** — create/edit/delete from detail Teams tab or `/organizations/:id/teams`.

## Validation

- Organization: name required, slug `^[a-z0-9]+(?:-[a-z0-9]+)*$`, description ≤ 280.
- Invite: email format, role required.
- Branding: hex colors `#RRGGBB`.
- Danger zone: transfer requires `TRANSFER`; delete requires org slug.

## Testing

Vitest + React Testing Library under `components/__tests__/`:

- OrganizationSwitcher
- OrganizationForm
- MemberTable
- InviteMemberModal
- PermissionMatrix
- RoleManagement

## Shell integration

`AuthenticatedShell` mounts `OrganizationSwitcher` via `AppShell` /
`Sidebar` `renderWorkspaceSwitcher`, and seeds the org list from
`useOrganizations()`.
