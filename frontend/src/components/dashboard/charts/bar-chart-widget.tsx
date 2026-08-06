"use client";

import * as React from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";

import { cn } from "@/lib/utils";
import {
  chartAxisProps,
  chartGridProps,
  seriesColor,
} from "@/components/dashboard/shared/chart-theme";
import { ChartTooltip } from "./chart-tooltip";
import type { BarChartWidgetProps } from "./types";

/**
 * Vertical or horizontal bar chart for velocity, workload, and comparisons.
 */
const BarChartWidget = React.memo(function BarChartWidget({
  data,
  series,
  xKey,
  height = 260,
  showLegend = true,
  showGrid = true,
  layout = "vertical",
  stacked = false,
  className,
  summary,
}: BarChartWidgetProps) {
  const isHorizontal = layout === "horizontal";

  return (
    <div
      data-slot="bar-chart-widget"
      className={cn("w-full", className)}
      style={{ height }}
      role="img"
      aria-label={summary}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout={isHorizontal ? "vertical" : "horizontal"}
          margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
        >
          {showGrid ? <CartesianGrid {...chartGridProps} /> : null}
          {isHorizontal ? (
            <>
              <XAxis type="number" {...chartAxisProps} />
              <YAxis type="category" dataKey={xKey} {...chartAxisProps} width={72} />
            </>
          ) : (
            <>
              <XAxis dataKey={xKey} {...chartAxisProps} />
              <YAxis {...chartAxisProps} width={40} />
            </>
          )}
          <ChartTooltip />
          {showLegend ? (
            <Legend wrapperStyle={{ fontSize: 12, color: "var(--muted-foreground)" }} />
          ) : null}
          {series.map((s, index) => (
            <Bar
              key={s.dataKey}
              dataKey={s.dataKey}
              name={s.name}
              fill={s.color ?? seriesColor(index)}
              radius={[4, 4, 0, 0]}
              stackId={stacked ? "stack" : undefined}
              maxBarSize={40}
              isAnimationActive
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
      <p className="sr-only">{summary}</p>
    </div>
  );
});

export { BarChartWidget };
