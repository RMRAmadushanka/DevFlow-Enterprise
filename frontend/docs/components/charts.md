# Charts

## Purpose

Reusable dashboard visualization primitives built with Recharts and DevFlow
tokens — not product analytics pages.

## Usage

| Chart | Use |
|-------|-----|
| `LineChartWidget` | Trends over time |
| `AreaChartWidget` | Volume / usage (no decorative gradients) |
| `BarChartWidget` | Comparisons / velocity |
| `DonutChartWidget` | Distribution |
| `RadarChartWidget` | Multi-axis profiles |
| `GaugeChart` | Health / availability |
| `HeatMapWidget` | Contribution grids |

Wrap charts in `ChartCard` for title, legend, export, and async states.

## When not to use

- Don’t invent one-off chart wrappers per feature
- Don’t hardcode hex colors — use `--chart-*` tokens
- Don’t omit accessible summaries

## Accessibility

Every chart requires a plain-language `summary` (`role="img"` + `sr-only`).

## Responsive Behavior

`ResponsiveContainer` resizes charts; dashboard grids collapse to one column on mobile.

## Examples

```tsx
import { ChartCard, LineChartWidget } from "@/components/dashboard";

<ChartCard title="Deployments" summary="Deployments over 30 days">
  <LineChartWidget data={rows} xKey="day" series={[…]} summary="…" />
</ChartCard>
```

## Storybook

`Dashboard/MetricCard` is the reference dashboard story. Add chart stories beside
widgets as they stabilize.

## Related

Deep guide: [dashboard-widgets.md](./dashboard-widgets.md)
