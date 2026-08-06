"use client";

import * as React from "react";
import {
  Area,
  AreaChart,
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
import type { AreaChartWidgetProps } from "./types";

/**
 * Clean enterprise area chart — no decorative gradients.
 */
const AreaChartWidget = React.memo(function AreaChartWidget({
  data,
  series,
  xKey,
  height = 260,
  showLegend = true,
  showGrid = true,
  stacked = false,
  className,
  summary,
}: AreaChartWidgetProps) {
  return (
    <div
      data-slot="area-chart-widget"
      className={cn("w-full", className)}
      style={{ height }}
      role="img"
      aria-label={summary}
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          {showGrid ? <CartesianGrid {...chartGridProps} /> : null}
          <XAxis dataKey={xKey} {...chartAxisProps} />
          <YAxis {...chartAxisProps} width={40} />
          <ChartTooltip />
          {showLegend ? (
            <Legend wrapperStyle={{ fontSize: 12, color: "var(--muted-foreground)" }} />
          ) : null}
          {series.map((s, index) => (
            <Area
              key={s.dataKey}
              type="monotone"
              dataKey={s.dataKey}
              name={s.name}
              stroke={s.color ?? seriesColor(index)}
              fill={s.color ?? seriesColor(index)}
              fillOpacity={0.15}
              strokeWidth={2}
              stackId={stacked ? "stack" : undefined}
              isAnimationActive
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
      <p className="sr-only">{summary}</p>
    </div>
  );
});

export { AreaChartWidget };
