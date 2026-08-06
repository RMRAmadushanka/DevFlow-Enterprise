# DevFlow Enterprise — Frontend Architecture

Scalable App Router architecture for 50+ pages, 100+ components, multi-org
permissions, and multi-team delivery.

**Scope of this deliverable.** Patterns, templates, folder structure, and
contracts only. No Projects / Tasks / Dashboard feature pages and no live API
integrations.

Related docs: [forms](../components/forms.md), [data-display](../components/data-display.md),
[navigation-feedback](../components/navigation-feedback.md),
[dashboard-widgets](../components/dashboard-widgets.md), [layout](../components/layout.md),
[folder structure](./folder-structure.md), [state management](./state-management.md),
[API patterns](./api-patterns.md), [getting started](../engineering/getting-started.md).

## Contents

1. [Principles](#principles)
2. [Folder structure](#folder-structure)
3. [Route groups](#route-groups)
4. [Feature module pattern](#feature-module-pattern)
5. [Page templates](#page-templates)
6. [Data fetching](#data-fetching)
7. [Service layer](#service-layer)
8. [State management](#state-management)
9. [URL state](#url-state)
10. [Permissions](#permissions)
11. [Errors, loading & empty](#errors-loading--empty)
12. [Form workflow](#form-workflow)
13. [Testing](#testing)
14. [Communication rules](#communication-rules)

## Principles

| Layer | Responsibility |
|-------|----------------|
| **Pages** (`app/`) | Composition — templates + feature hooks |
| **Features** (`features/`) | Domain UI, hooks, services, schemas |
| **Components** (`components/`) | Reusable design-system / product UI |
| **Hooks** (`hooks/`) | Shared non-domain logic |
| **Services** (per feature) | Typed API I/O only |
| **Types / schemas** | Contracts & validation |

- Components never call APIs directly.
- Zustand never holds server entities.
- TanStack Query owns server cache.
- Copy `features/_template` for every new domain.

## Folder structure

```
src/
  app/
    (public)/layout.tsx       # Marketing / public chrome
    (auth)/layout.tsx         # Sign-in / sign-up chrome
    (dashboard)/layout.tsx    # Authenticated product shell (wire AppShell later)
    design-system/            # Living style guide (existing)
    shell-preview/            # Layout harness (existing)

  components/
    ui/                       # Primitives (shadcn)
    layout/                   # AppShell, PageHeader, page-templates/
    forms/ data-display/ feedback/ navigation/ dashboard/
    architecture/             # PageError, PageSkeleton, FeatureEmptyState

  features/
    _template/                # Canonical feature scaffold (copy → rename)

  lib/
    api/                      # apiClient, ApiError, createQueryKeys
    auth/                     # Session contracts (stubs)
    permissions/              # Roles, PermissionGuard, PermissionProvider
    patterns/                 # Form workflow contract
    utils.ts

  hooks/                      # useModal, useUrlState, usePagination, …
  store/                      # Zustand UI stores only
  types/                      # Cross-cutting contracts
  config/                     # routes, query defaults, app metadata
  providers/                  # QueryClient, toasts, tooltips
  design-system/              # Tokens & theme
```

## Route groups

| Group | Purpose |
|-------|---------|
| `(public)` | Unauthenticated marketing surfaces |
| `(auth)` | Centered auth flows |
| `(dashboard)` | Product app — mount `PermissionProvider` + `AppShell` when session exists |

Route groups do not affect the URL. Register feature pages under
`(dashboard)/projects/page.tsx` etc. when building product features.

Typed hrefs live in `src/config/routes.ts`.

## Feature module pattern

```
features/<name>/
  components/          # Domain UI (+ __tests__)
  hooks/               # useGetX, useCreateX (+ __tests__)
  services/            # x.service.ts (+ __tests__)
  store/               # UI-only Zustand (optional)
  schemas/             # Zod
  types/
  utils/
  constants/
  index.ts             # Public barrel
```

Scaffold: `src/features/_template` (Entity placeholder).

```bash
# Mental model — copy and rename Entity → Project / Task / …
cp -r src/features/_template src/features/projects
```

Public import:

```tsx
import { useGetEntities, EntityCard } from "@/features/_template";
```

## Page templates

Location: `src/components/layout/page-templates/`

| Template | Use |
|----------|-----|
| `ListPageTemplate` | Search, filters, table/card toggle, pagination |
| `DetailPageTemplate` | Breadcrumbs, tabs, main + side panel |
| `CrudPageTemplate` | Create/edit form + actions |
| `SettingsPageTemplate` | Settings nav + content panel |
| `DashboardPageTemplate` | Filters + widget/chart grid |
| `WizardPageTemplate` | Stepper + step body + nav actions |

Example composition (illustrative — not a real page):

```tsx
<ListPageTemplate
  title="Projects"
  actions={<Button>New project</Button>}
  filters={<SearchInput … />}
  pagination={<Pagination … />}
>
  <ProjectTable … />
</ListPageTemplate>
```

## Data fetching

Stack: **TanStack Query** (wired in `AppProviders` via `config/query.ts`).

Pattern:

```
Page → useGetProjects() → projectService.list() → apiClient()
```

Query keys:

```ts
import { createQueryKeys } from "@/lib/api";
export const projectKeys = createQueryKeys("projects");
```

Mutation hooks invalidate list/detail keys on success. See
`features/_template/hooks/use-entities.ts`.

## Service layer

```ts
// features/x/services/x.service.ts
export const xService = {
  list: (params) => apiClient("/api/x", { query: params }),
  getById: (id) => apiClient(`/api/x/${id}`),
  create: (input) => apiClient("/api/x", { method: "POST", body: input }),
};
```

Rules: no React, no toasts, no navigation, typed responses, throw `ApiError`.

## State management

| Concern | Tool |
|---------|------|
| Server data | TanStack Query |
| Global UI (sidebar, modals, density) | Zustand (`store/`) |
| Feature UI (view mode, panel open) | Feature Zustand store |
| Form draft | React Hook Form |
| Shareable list state | URL (`useUrlState`) |

Zustand stores in this foundation:

- `useLayoutStore` — mobile nav / command menu
- `useUIPreferencesStore` — density / sidebar collapse (persisted)
- `useModalStore` — global modal registry by id

## URL state

```ts
const { state, setKey } = useUrlState({
  defaults: { page: 1, pageSize: 20, status: "", q: "" },
});
// → /projects?page=2&status=active&q=api
```

Keep `defaults` referentially stable (module constant) to avoid extra navigations.

## Permissions

Roles: **Owner → Admin → Manager → Developer → Viewer**

```tsx
import { PermissionProvider, PermissionGuard } from "@/lib/permissions";

<PermissionProvider role="admin">
  <PermissionGuard permission="project.delete">
    <Button>Delete</Button>
  </PermissionGuard>
</PermissionProvider>
```

Imperative: `const { can } = usePermissions()`.

## Errors, loading & empty

| Concern | Component |
|---------|-----------|
| Route crash | `ErrorBoundary` / `PageError` |
| Section failure | `FeatureError` |
| Offline / transport | `NetworkError` |
| 403 UI | `PermissionError` |
| Route loading | `PageSkeleton` (`list` \| `detail` \| `dashboard` \| `form` \| `settings`) |
| Feature empty | `FeatureEmptyState` (`no-data` \| `no-results` \| `no-permission` \| `first-time`) |

Import from `@/components/architecture`.

## Form workflow

```
Open (modal / CRUD route)
  → Validate (Zod + AppForm)
  → Mutate (useCreateX)
  → Toast
  → Invalidate queries
```

See `src/lib/patterns/form-workflow.ts`.

## Testing

Every feature should include:

```
components/__tests__/
hooks/__tests__/
services/__tests__/
```

Cover rendering, user actions, validation, permissions, loading, and errors.
Foundation tests exist for `PermissionGuard`, `ListPageTemplate`, and the
`_template` feature slices.

## Communication rules

1. **Pages** compose templates and feature barrels only.
2. **Features** own domain UI and data hooks.
3. **Shared components** stay domain-agnostic.
4. **Hooks** encapsulate logic; keep JSX thin.
5. **Services** talk to the network.
6. **Types/schemas** are the contract between layers.

## Getting started (next feature)

1. Copy `features/_template` → `features/<domain>`.
2. Rename Entity → domain nouns (types, keys, service paths).
3. Add `(dashboard)/<route>/page.tsx` composing a page template.
4. Wire list URL state with `useUrlState` + `useGetX`.
5. Gate destructive actions with `PermissionGuard`.
6. Add `__tests__` beside components/hooks/services.
