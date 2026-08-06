# State Management

## Decision table

| State kind | Tool | Examples |
|------------|------|----------|
| Server / async data | **TanStack Query** | Lists, detail, mutations |
| Global UI chrome | **Zustand** | Sidebar collapse, modal registry, command menu |
| Feature UI chrome | Feature Zustand store | Table vs card view, panel open |
| Form draft | **React Hook Form** | Create/edit forms |
| Shareable list params | **URL** (`useUrlState`) | `?page=2&status=active` |
| Theme | **next-themes** | Light / dark / system |

## Rules

1. **Never** store server entities in Zustand  
2. Components never call `apiClient` — use feature hooks  
3. Prefer URL state for filters/pagination/search/sort on list pages  
4. Keep Zustand slices small and UI-only  
5. Invalidate query keys after mutations (`createQueryKeys`)

## Existing stores

| Store | Purpose |
|-------|---------|
| `useLayoutStore` | Mobile nav + command menu open |
| `useUIPreferencesStore` | Density + sidebar collapsed (persisted) |
| `useModalStore` | Global modal open/payload by id |

## Example flow

```
List page
  → useUrlState({ page, q, status })
  → useGetEntities(params)          // TanStack Query
  → entityService.list(params)      // fetch
  → useEntityUiStore.viewMode       // local UI only
```

See also: [frontend.md](./frontend.md) · [api-patterns.md](./api-patterns.md)
