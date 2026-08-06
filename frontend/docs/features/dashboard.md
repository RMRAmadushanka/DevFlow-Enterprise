# Main Dashboard

Engineering operations overview for DevFlow Enterprise — KPIs, projects,
deployments, sprints, workload, and activity.

**Scope.** Frontend feature + mock service only. Reuses `@/components/dashboard`
widgets and charts (no duplicate MetricCard/chart primitives).

## Architecture

```
/dashboard (DashboardPageTemplate)
  → DashboardView
    → Header / Filters / Preferences
    → Widgets (compose design-system dashboard components)
      → useDashboardMetrics() → dashboard.service.ts (mock)
      → useDashboardStore (filters + layout preferences)
```

## Route

| Route | Purpose |
|-------|---------|
| `/dashboard` | Main authenticated landing page |
| `/home` | Redirects to `/dashboard` |

Login success navigates to `routes.app.dashboard`.

## Widgets

| Widget | Data | UI building blocks |
|--------|------|--------------------|
| OverviewMetrics | KPI + system health | `MetricCard`, `SystemStatusWidget` |
| ProjectOverviewWidget | Projects | `DashboardTable` / cards + `ProgressBar` |
| ProjectStatusChart | Status mix | `DonutChartWidget` |
| TeamActivityWidget | Activity | `ActivityFeed` |
| DeploymentSummaryWidget | Deployments | `DashboardTable` + `StatusBadge` |
| DeploymentTrendChart | Trend | `LineChartWidget` |
| SprintProgressWidget | Sprint | `ProgressWidget` |
| SprintBurndownChart | Burndown | `AreaChartWidget` |
| WorkloadWidget | Members | `DashboardTable` |
| TeamWorkloadChart | Capacity | `BarChartWidget` |
| RecentProjectsWidget | Latest projects | Table (desktop) / cards (mobile) |
| RecentActivityWidget | Timeline | `DashboardTimeline` |
| QuickActions | Navigation | `Button` + `PermissionGuard` |

Heavy charts are lazy-loaded via `React.lazy`.

## State management

| Concern | Tool |
|---------|------|
| Filters (org, team, project, env, date range) | Zustand `useDashboardStore` |
| Visible widgets / order | Zustand (persisted) |
| Snapshot data | TanStack Query `useDashboardMetrics` |

Mock dataset: `constants/mock-data.ts` — not hardcoded in components.

## User interactions

1. Change filters → query key changes → snapshot refetches
2. Customize → toggle widgets / reorder → persisted preferences
3. Export report → mock export toast
4. Quick actions → navigate to reserved product routes

## Testing

Vitest + RTL under `components/__tests__/`:

- DashboardHeader
- DashboardFilters
- OverviewMetrics
- ProjectOverviewWidget
- TeamActivityWidget
- DeploymentSummaryWidget
- DashboardPreferences

## Accessibility

- Chart `summary` / `aria-label` on chart widgets
- Status badges include text labels (not color-only)
- Filter controls use labeled groups
- Loading announced via `aria-busy` on skeleton
