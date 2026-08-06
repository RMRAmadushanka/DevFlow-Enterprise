# Tables

## Purpose

Dense, accessible data tables for enterprise list views (projects, deployments,
users, audit logs).

## Usage

- Prefer `DataTable` from `@/components/data-display/table`
- Dashboard compact lists: `DashboardTable`
- Pair with URL state (`page`, `sort`, `q`) via `useUrlState`

## When not to use

- Simple key/value metadata → definition lists or detail panels
- Tiny option pickers → Select / Combobox
- Infinite activity streams → virtualized list / timeline

## Variants / modes

| Mode | When |
|------|------|
| Comfortable / compact density | User preference or dashboard chrome |
| Sortable columns | Server or client sorting |
| Selectable rows | Bulk actions |
| Expandable rows | Nested detail |

## States

Default · Loading (`SkeletonTable`) · Empty · Error · No search results

## Accessibility

- Column headers announce sort state
- Row selection uses checkboxes with labels
- Keyboard focus must reach interactive cells

## Responsive Behavior

Collapse to cards on small screens when density demands it (`useIsMobile`).

## Examples

```tsx
import { DataTable } from "@/components/data-display/table";

<DataTable columns={columns} data={rows} enablePagination noun="projects" />
```

## Related

- Deep guide: [data-display.md](./data-display.md)
- Template: [ListPageTemplate](../architecture/frontend.md#page-templates)
