# DevFlow Enterprise — Data Display System

A reusable, type-safe, accessible data display component system for DevFlow
Enterprise. It backs tables, lists, cards, metrics, filters, timelines, and
file surfaces across Projects, Tasks, Sprints, Deployments, and more.

**Scope.** Like the [form system](./forms.md) and [layout system](./layout.md),
this is a component layer only: no page components, no API calls, no mock
business data. Every component is prop-driven — pages pass real records,
column definitions, and callbacks.

## Contents

1. [Composition overview](#composition-overview)
2. [Folder structure](#folder-structure)
3. [Shared utilities](#shared-utilities)
4. [DataTable](#datatable)
5. [EnterpriseDataGrid](#enterprisedatagrid)
6. [Lists & cards](#lists--cards)
7. [Metrics & statistics](#metrics--statistics)
8. [Badges, avatars & status](#badges-avatars--status)
9. [Progress](#progress)
10. [Filters, search & sorting](#filters-search--sorting)
11. [Pagination](#pagination)
12. [Empty, loading & skeleton](#empty-loading--skeleton)
13. [Timeline & activity](#timeline--activity)
14. [File display](#file-display)
15. [Accessibility](#accessibility)
16. [Responsive behavior](#responsive-behavior)
17. [Motion](#motion)
18. [Performance](#performance)
19. [Testing](#testing)
20. [Best practices](#best-practices)

## Composition overview

Import from the barrel:

```tsx
import {
  DataTable,
  StatCard,
  StatusBadge,
  EmptyState,
  AdvancedFilter,
  Pagination,
} from "@/components/data-display";
```

A typical list page composes toolbar + table + pagination (pagination is
built into `DataTable` when enabled):

```tsx
"use client";

import { type ColumnDef, DataTable, StatusBadge } from "@/components/data-display";
import { Button } from "@/components/ui/button";

type Project = {
  id: string;
  name: string;
  status: "active" | "paused" | "archived";
  owner: string;
};

const columns: ColumnDef<Project>[] = [
  { accessorKey: "name", header: "Name" },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ getValue }) => {
      const status = getValue<Project["status"]>();
      const tone =
        status === "active" ? "success" : status === "paused" ? "warning" : "neutral";
      return <StatusBadge tone={tone} dot>{status}</StatusBadge>;
    },
  },
  { accessorKey: "owner", header: "Owner" },
];

export function ProjectsTable({ data }: { data: Project[] }) {
  return (
    <DataTable
      columns={columns}
      data={data}
      getRowId={(row) => row.id}
      enableRowSelection
      exportFilename="projects"
      noun="projects"
      bulkActions={({ selectedRows }) => (
        <Button size="sm" variant="destructive">
          Delete {selectedRows.length}
        </Button>
      )}
      renderMobileCard={(row) => (
        <div className="rounded-lg border border-border p-3">
          <p className="font-medium">{row.original.name}</p>
          <p className="text-sm text-muted-foreground">Owner: {row.original.owner}</p>
        </div>
      )}
    />
  );
}
```

## Folder structure

```
src/components/data-display/
  shared/          # types, hooks, formatters
  table/           # DataTable, TableToolbar, export
  data-grid/       # EnterpriseDataGrid (virtualized)
  list/            # DataList
  cards/           # DataCard
  badges/          # StatusBadge
  avatars/         # UserAvatar, UserAvatarGroup
  status/          # StatusIndicator
  metrics/         # StatCard
  statistics/      # StatsGrid, StatsSummary
  pagination/      # Pagination
  filters/         # AdvancedFilter, FilterChip
  sorting/         # SortDropdown
  search/          # GlobalSearchInput, SearchResultItem
  empty-state/     # EmptyState
  loading/         # Spinner, LoadingOverlay
  skeleton/        # SkeletonText/Card/Table/Avatar/Chart
  timeline/        # Timeline
  activity/        # ActivityTimeline
  progress/        # ProgressBar, CircularProgress
  file-preview/    # FileCard, FilePreview
  index.ts
```

## Shared utilities

| Export | Purpose |
|--------|---------|
| `Tone` | `success \| warning \| danger \| info \| neutral` |
| `Density` | `compact \| comfortable` |
| `DisplaySize` | `sm \| md \| lg` |
| `useControllableState` | Controlled/uncontrolled values |
| `useDebouncedValue` | Debounce for search |
| `useIsMobile` | `< md` breakpoint for table→card |
| `formatBytes` / `formatCompactNumber` / `formatChange` / `formatRelativeTime` / `formatRangeSummary` | Display formatters |

## DataTable

**Purpose.** Enterprise table on TanStack Table for day-to-day record lists.

**Features.** Sorting, global filter, pagination, row selection (single/multi),
column visibility, column resizing, row expansion, sticky header, CSV export,
loading skeleton, empty state, bulk actions, optional mobile card renderer.

### Key props

| Prop | Notes |
|------|-------|
| `columns` / `data` | TanStack `ColumnDef` + row data |
| `enableRowSelection` | Adds checkbox column |
| `enableColumnResizing` | Drag separators on headers |
| `enableExpanding` + `renderExpandedRow` | Expandable detail rows |
| `manualSorting` / `manualFiltering` / `manualPagination` | Server-side modes |
| `exportFilename` | Shows Export → downloads CSV |
| `bulkActions` | Render prop when rows are selected |
| `renderMobileCard` | Below `md`, replaces table with cards |
| `stickyHeader` | Sticky `thead` inside scrollport |

### TableToolbar

Built into `DataTable`. Contains search, column settings, export, custom
`toolbarActions`, and the bulk-action region.

## EnterpriseDataGrid

**Purpose.** Large-dataset grid (thousands of rows) with virtual scrolling.

**Features.** `@tanstack/react-virtual` row virtualization, sticky leading
columns (`stickyColumnCount`), column resize, keyboard navigation
(↑/↓/Home/End, Space to select), optional inline `renderRowActions`.

Prefer `DataTable` for paginated CRUD lists; use `EnterpriseDataGrid` when
the user needs to scan a large in-memory set without paging.

## Lists & cards

### DataList

Compact/comfortable list for notifications, documents, activities.

```tsx
<DataList
  density="compact"
  items={[
    { id: "1", title: "Build passed", description: "main · 2m ago", icon: <Check /> },
  ]}
  onItemSelect={(id) => open(id)}
/>
```

### DataCard

Variants: `default` | `compact` | `interactive` | `selectable`.

Selectable/interactive cards are a **single** focusable element (`role="checkbox"` /
`role="button"`) — the checkmark is decorative (WCAG 4.1.2).

## Metrics & statistics

### StatCard

```tsx
<StatCard
  title="Active Projects"
  value={24}
  change={12}
  changeLabel="this month"
  trend="up"
  icon={<FolderKanban />}
/>
```

`StatsGrid` / `StatsSummary` lay out multiple stats without cards when you
need a denser KPI strip.

## Badges, avatars & status

| Component | Use for |
|-----------|---------|
| `StatusBadge` | Semantic labels (`Production`, `Failed`) with tone, optional dot/icon |
| `StatusIndicator` | Inline `● Label` with optional pulse |
| `UserAvatar` | Image or initials + optional presence |
| `UserAvatarGroup` | Stacked avatars with `+N` overflow |

## Progress

- `ProgressBar` — linear, tone-aware, optional label/animation
- `CircularProgress` — SVG ring for compact metrics

## Filters, search & sorting

### GlobalSearchInput

Debounced search with clear, loading, optional `/` focus shortcut.
(`shortcut={null}` disables the hint — used inside table toolbars.)

### SearchResultItem

Icon + title + description + category for command/search result lists.

### SortDropdown

Multi-field sort rules (`asc`/`desc`). Trigger mirrors active rules as
`Created Date ↓ · Priority ↑`.

### AdvancedFilter

Composable filter bar: optional search, condition chips, popover to add
text/select/date/range conditions. Fully controlled — **you** apply the
conditions to your query/data.

```tsx
<AdvancedFilter
  fields={[
    { id: "status", label: "Status", type: "select", options: statusOptions },
    { id: "owner", label: "Owner", type: "text" },
    { id: "created", label: "Created", type: "date-range" },
  ]}
  value={conditions}
  onValueChange={setConditions}
  searchValue={q}
  onSearchChange={setQ}
/>
```

## Pagination

Controlled page/page-size control with range summary
(`Showing 1-20 of 500`), ellipsis page list, and optional page-size select.

## Empty, loading & skeleton

| Component | Variants / notes |
|-----------|------------------|
| `EmptyState` | `no-data`, `no-results`, `no-permission`, `error` + `action` slot |
| `Spinner` | Sized status spinner |
| `LoadingOverlay` | Absolute overlay with blur option |
| `SkeletonText` / `SkeletonCard` / `SkeletonTable` / `SkeletonAvatar` / `SkeletonChart` | Layout placeholders |

## Timeline & activity

### Timeline

Vertical or horizontal milestones (releases, deployments).

### ActivityTimeline

Avatar + action + relative timestamp for audit/history feeds.

```tsx
<ActivityTimeline
  items={[
    {
      id: "1",
      user: { name: "John", imageUrl: "/…" },
      action: "deployed v2.1",
      timestamp: Date.now() - 5 * 60_000,
    },
  ]}
/>
```

## File display

- `FileCard` — type icon, name, size, actions (actions are siblings of the
  name button — no nested interactives)
- `FilePreview` — image / PDF iframe / document placeholder
- `resolveFileKind` / `formatBytes` helpers

## Accessibility

- Keyboard: table header sort (Enter/Space), grid ↑↓/Home/End/Space,
  selectable cards, list items
- ARIA: `aria-sort`, `aria-label` on tables/grids, `aria-busy` while loading,
  `role="alert"` on error empty states, selection checkboxes labeled
- Focus rings on all interactive surfaces
- Target WCAG AA contrast via design tokens

## Responsive behavior

| Viewport | Behavior |
|----------|----------|
| Desktop | Full `DataTable` / grid |
| Tablet | Compact density, wrapping toolbars |
| Mobile | Pass `renderMobileCard` — table collapses to cards below `md` |

## Motion

Framer Motion, tokenized via `@/design-system/tokens/motion`:

- Row / list / timeline entrance (staggered, ≤ ~120ms)
- Card hover lift
- Empty state / overlay fade
- Progress fill animation

Keep motion subtle — nothing longer than ~400ms outside page transitions.

## Performance

- `EnterpriseDataGrid` virtualizes rows (`overscan: 10`) for 10k+ records
- `DataTable` paginates by default — prefer server `manual*` modes for large remote sets
- Column defs should be stable (`useMemo`) to avoid remounting the table
- Avoid putting heavy nodes in every cell; prefer lightweight renderers

## Testing

Unit tests cover DataTable, Pagination, Filters, Search, Cards, Badges,
EmptyState, and loading overlays (Vitest + Testing Library + jest-axe).

```bash
npm test -- src/components/data-display
```

## Best practices

1. **Own your data.** Components never fetch — pass `data`, loading, and empty.
2. **Prefer `DataTable` for CRUD lists; `EnterpriseDataGrid` for dense scans.**
3. **Stable `columns` + `getRowId`.** Prevents selection/expansion glitches.
4. **Use `StatusBadge` for states, not raw `Badge`.** Keeps tone vocabulary consistent.
5. **Provide `renderMobileCard` for any primary table** users will open on phones.
6. **Don't nest interactive controls** inside selectable cards or file-card name buttons — use the `actions` / `trailing` slots.
7. **Server-side when possible.** Set `manualPagination` / `manualSorting` /
   `manualFiltering` and drive state from the URL or query client.
