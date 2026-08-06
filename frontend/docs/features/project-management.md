# Project Management

Frontend feature module for listing, creating, and managing software projects
in DevFlow Enterprise.

**Scope.** UI + mock services only — no Projects backend, and no full
Tasks / Sprints / Deployments / Documents product modules (those tabs are
placeholders or deep-links).

## Architecture

```
Page (app/(dashboard)/projects/*)
  → Feature components (ProjectListView, ProjectDetailShell, …)
    → Hooks (TanStack Query)
      → project.service.ts (in-memory mock)
      → useProjectStore (filters, sort, view mode)
```

Components never call services directly. Pages stay thin and import from
`@/features/projects`.

Permissions reuse `@/lib/permissions`
(`project.read|create|update|delete`).

## Routes

| Route | Purpose |
|-------|---------|
| `/projects` | List (table / grid / compact) |
| `/projects/new` | Create project |
| `/projects/:projectId` | Overview |
| `/projects/:projectId/edit` | Edit form |
| `/projects/:projectId/settings` | General + danger zone |
| `/projects/:projectId/activity` | Activity timeline |
| `/projects/:projectId/members` | Members table |
| `/projects/:projectId/analytics` | Analytics charts |
| `/projects/:projectId/repository` | Repository card |
| `/projects/:projectId/environments` | Environment cards |
| `/projects/:projectId/tasks` | Placeholder → Tasks module |
| `/projects/:projectId/sprints` | Placeholder |
| `/projects/:projectId/documents` | Placeholder → Documents |

Typed hrefs: `@/config/routes` (`routes.app.projects`, `project(id)`, …).

## Folder

```
src/features/projects/
  components/   # list, detail, forms, modals, skeletons
  hooks/        # useProjects, useProject, mutations
  services/     # project.service.ts
  schemas/      # Zod create/update/settings/danger flows
  types/
  store/project.store.ts
  constants/
  utils/
  index.ts
```

## Components

| Area | Components |
|------|------------|
| List | `ProjectListView`, `ProjectSearch`, `ProjectFilters`, `ProjectSort`, `ProjectTable`, `ProjectGrid`, `ProjectCard` |
| Detail | `ProjectDetailShell`, `ProjectHeader`, `ProjectHero`, `ProjectOverview`, `ProjectSidebar`, tabs helpers |
| Domain panels | `ProjectStatistics`, `ProjectMembers`, `ProjectTimeline`, `ProjectAnalytics`, `ProjectRepositoryCard`, `ProjectEnvironmentsList` |
| Forms / danger | `ProjectForm`, `ProjectSettingsForm`, archive / delete / transfer / duplicate modals |
| Shared | `ProjectStatusBadge`, `ProjectHealthCard`, `FavoriteProjectButton`, `ProjectQuickActions`, skeletons, empty states |

## Hooks

| Hook | Responsibility |
|------|----------------|
| `useProjects` | Filtered/sorted list for current org |
| `useProject` | Detail payload |
| `useCreateProject` / `useUpdateProject` | Mutations + cache invalidation |
| `useArchiveProject` / `useDeleteProject` | Destructive flows |
| `useDuplicateProject` / `useTransferProjectOwnership` | Copy / ownership |
| `useToggleFavorite` | Favorite star |

## Services

`project.service.ts` keeps an in-memory seed aligned with dashboard project IDs
(`proj_api`, `proj_web`, `proj_mobile`, `proj_infra`, `proj_docs`). It supports
list/filter/sort, detail, create/update, favorite, archive, duplicate, transfer,
and delete. Swap the service body for real API clients later without changing
hooks or UI.

## State management

| Concern | Tool |
|---------|------|
| Filters, sort, view mode | Zustand `useProjectStore` (persisted prefs) |
| Lists / detail | TanStack Query (`projectKeys`) |
| Form drafts | React Hook Form + Zod |

## User flows

1. **Browse projects** — `/projects` → search/filter/sort → table or cards.
2. **Create project** — Create → validated form → mock create → detail redirect.
3. **Inspect project** — Overview stats, milestones, activity, sidebar meta.
4. **Manage members / activity / analytics / repository / environments** — dedicated routes under the detail shell tabs.
5. **Settings / danger zone** — archive, transfer ownership (type `TRANSFER`), delete (type project key).

## Permissions

| Action | Permission |
|--------|------------|
| View list / detail | `project.read` (route-level via app shell) |
| Create / duplicate | `project.create` |
| Edit / settings / archive / transfer | `project.update` |
| Delete | `project.delete` |

## Validation

Zod schemas in `schemas/project.schema.ts`:

- Name required (2–80)
- Key uppercase `[A-Z][A-Z0-9]*` (2–12)
- Repository URL format when provided
- Description max 500
- Settings / transfer / delete / duplicate confirmation shapes

## Testing strategy

Vitest + React Testing Library under
`components/__tests__/`:

- List view, card, table
- Form, filters, search
- Tabs helpers
- Settings form
- Analytics widgets
- Member list

Run:

```bash
npm test -- src/features/projects
```

## Accessibility & responsive notes

- Keyboard-friendly menus, search, and table actions
- Status/health via `StatusBadge` (semantic tones)
- Mobile: cards instead of table on the list page
- Visible focus rings on interactive links/buttons

## Performance notes

- Analytics charts are memoized (`React.memo`) and can be Suspense-wrapped
- Progress bars in tables disable fill animation (`animated={false}`)
- List query keys include filters + sort for cache isolation
