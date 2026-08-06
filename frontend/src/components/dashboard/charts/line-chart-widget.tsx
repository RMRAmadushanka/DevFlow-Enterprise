"use client";

import * as React from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
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
import type { LineChartWidgetProps } from "./types";

/**
 * Multi-series line chart for trends (deployments, activity, performance).
 */
const LineChartWidget = React.memo(function LineChartWidget({
  data,
  series,
  xKey,
  height = 260,
  showLegend = true,
  showGrid = true,
  connectNulls = true,
  className,
  summary,
}: LineChartWidgetProps) {
  return (
    <div
      data-slot="line-chart-widget"
      className={cn("w-full", className)}
      style={{ height }}
      role="img"
      aria-label={summary}
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          {showGrid ? <CartesianGrid {...chartGridProps} /> : null}
          <XAxis dataKey={xKey} {...chartAxisProps} />
          <YAxis {...chartAxisProps} width={40} />
          <ChartTooltip />
          {showLegend ? (
            <Legend wrapperStyle={{ fontSize: 12, color: "var(--muted-foreground)" }} />
          ) : null}
          {series.map((s, index) => (
            <Line
              key={s.dataKey}
              type="monotone"
              dataKey={s.dataKey}
              name={s.name}
              stroke={s.color ?? seriesColor(index)}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
              connectNulls={connectNulls}
              isAnimationActive
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
      <p className="sr-only">{summary}</p>
    </div>
  );
});

export { LineChartWidget };
