# DevFlow Enterprise — Dashboard Widgets & Charts

Reusable dashboard layout, KPI, chart, and status components for DevFlow Enterprise.

**Scope.** Like [forms](./forms.md), [data-display](./data-display.md), and
[navigation-feedback](./navigation-feedback.md), this is a component layer only:
no dashboard pages, no analytics pages, no API calls, no mock business datasets
in the library. Every surface is prop-driven.

## Contents

1. [Composition overview](#composition-overview)
2. [Folder structure](#folder-structure)
3. [Layout](#layout)
4. [Widgets & cards](#widgets--cards)
5. [Charts](#charts)
6. [Activity, status & progress](#activity-status--progress)
7. [Filters, dates & export](#filters-dates--export)
8. [Tables](#tables)
9. [Accessibility](#accessibility)
10. [Theming & performance](#theming--performance)
11. [Testing](#testing)
12. [Best practices](#best-practices)

## Composition overview

```tsx
import {
  DashboardGrid,
  DashboardGridItem,
  DashboardSection,
  WidgetCard,
  MetricCard,
  ChartCard,
  LineChartWidget,
  DateRangeSelector,
  ExportButton,
  ActivityFeed,
} from "@/components/dashboard";

<DashboardSection title="Project Overview" description="Last 30 days">
  <DashboardGrid columns={12} gap={4}>
    <DashboardGridItem span={1} mdSpan={3} xlSpan={3}>
      <MetricCard title="Active Projects" value={24} change={12} />
    </DashboardGridItem>
    <DashboardGridItem span={1} mdSpan={6} xlSpan={6}>
      <ChartCard title="Deployments" summary="Deployments over the last 30 days">
        <LineChartWidget
          data={rows}
          xKey="day"
          series={[{ dataKey: "deploys", name: "Deployments" }]}
          summary="Deployments over the last 30 days"
        />
      </ChartCard>
    </DashboardGridItem>
  </DashboardGrid>
</DashboardSection>
```

## Folder structure

```
src/components/dashboard/
  layout/          # DashboardGrid, DashboardSection
  widgets/         # WidgetCard, empty / skeleton / error
  cards/           # MetricCard, StatisticCard
  charts/          # ChartCard + Recharts widgets
  metrics/         # Barrel re-exports
  tables/          # DashboardTable
  filters/         # ChartFilter
  activity/        # ActivityFeed, DashboardTimeline
  progress/        # ProgressWidget
  status/          # SystemStatusWidget, LiveIndicator
  date-controls/   # DateRangeSelector
  export/          # ExportButton
  shared/          # Types + chart theme tokens
```

## Layout

### DashboardGrid

Responsive CSS grid. Mobile is single-column; tablet/desktop expand by `columns`.

| Prop | Type | Default |
|------|------|---------|
| `columns` | `1 \| 2 \| 3 \| 4 \| 6 \| 12` | `12` |
| `gap` | `2–8` | `4` |
| `label` | `string` | `"Dashboard"` |

`DashboardGridItem` accepts `span`, `mdSpan`, `xlSpan`, and `rowSpan` for drag-ready cell sizing.

### DashboardSection

Groups widgets under a title, description, and optional actions.

## Widgets & cards

### WidgetCard

Base chrome for all widgets: header, content, footer, plus `loading` / `empty` / `error`.

### MetricCard

KPI tile with value, trend delta, and optional variant (`default` \| `success` \| `warning` \| `danger`).

### StatisticCard

Larger statistic emphasis with left accent border and comparison slot.

### ProgressWidget

Goal / percentage progress using the shared `ProgressBar`.

### DashboardEmptyState / DashboardSkeleton / WidgetError

Async placeholders tuned for dashboard density.

## Charts

All charts use **Recharts** + theme CSS variables (`--chart-1` … `--chart-5`).
Gradients are intentionally avoided for a clean enterprise look.

| Component | Use |
|-----------|-----|
| `ChartCard` | Title, legend, actions, export, async states |
| `LineChartWidget` | Trends, frequency |
| `AreaChartWidget` | Traffic / usage (flat fill opacity) |
| `BarChartWidget` | Velocity / workload (`vertical` \| `horizontal`) |
| `DonutChartWidget` | Distribution + center value |
| `RadarChartWidget` | Multi-axis comparison |
| `GaugeChart` | Health / availability |
| `HeatMapWidget` | Contribution / activity grid |

Every chart widget requires a `summary` string for screen readers (`role="img"` + `sr-only`).

## Activity, status & progress

- **ActivityFeed** — wraps data-display `ActivityTimeline` in `WidgetCard`
- **DashboardTimeline** — wraps data-display `Timeline`
- **SystemStatusWidget** — Healthy / Warning / Critical / Offline (text + color)
- **LiveIndicator** — pulsing live / offline chip

## Filters, dates & export

### DateRangeSelector

Presets: Today, 7 days, 30 days, 90 days, Custom (optional from/to inputs).

### ChartFilter

Multiple labeled dropdowns; values are a `Record<filterId, string | null>`.

### ExportButton

Menu for PDF / CSV / Excel. Parent owns the export work via `onExport`.
Statuses: `idle` \| `loading` \| `success` \| `error`.

## Tables

`DashboardTable` is a compact `DataTable` inside `WidgetCard` chrome
(pagination, actions, loading/empty/error).

## Accessibility

- Regions and groups expose `aria-label`
- Chart widgets provide text summaries
- Status never relies on color alone (labels always present)
- Date/filter controls are keyboard operable
- Loading states set `aria-busy`

## Theming & performance

- Chart strokes/fills use CSS variables so light/dark track the design system
- Chart widgets are wrapped in `React.memo`
- Prefer stable `data` / `series` references from the parent to avoid redraws
- Use `DashboardSkeleton` instead of mounting heavy charts while fetching

## Testing

Covered unit tests:

- MetricCard, WidgetCard, ChartCard
- DateRangeSelector, ChartFilter, ExportButton

## Best practices

1. Compose pages from these primitives — do not put domain fetch logic inside widgets.
2. Pass formatted values into MetricCard / StatisticCard; keep formatting in the page layer.
3. Always supply chart `summary` text that states the insight in plain language.
4. Pair `ChartCard` + chart widget; use `ExportButton` in `exportSlot` when needed.
5. Prefer `DashboardGridItem` spans over custom width hacks for responsive layouts.
