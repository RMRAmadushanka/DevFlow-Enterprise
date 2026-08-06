"use client";

import * as React from "react";
import { Cell, Legend, Pie, PieChart, ResponsiveContainer } from "recharts";

import { cn } from "@/lib/utils";
import { seriesColor } from "@/components/dashboard/shared/chart-theme";
import { ChartTooltip } from "./chart-tooltip";
import type { DonutChartWidgetProps } from "./types";

/**
 * Donut chart with optional center value and legend — status / category mix.
 */
const DonutChartWidget = React.memo(function DonutChartWidget({
  data,
  centerValue,
  centerLabel,
  height = 260,
  showLegend = true,
  className,
  summary,
  innerRadius = 68,
  outerRadius = 96,
}: DonutChartWidgetProps) {
  return (
    <div
      data-slot="donut-chart-widget"
      className={cn("relative w-full", className)}
      style={{ height }}
      role="img"
      aria-label={summary}
    >
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            paddingAngle={2}
            stroke="var(--card)"
            strokeWidth={2}
            isAnimationActive
          >
            {data.map((entry, index) => (
              <Cell key={entry.name} fill={entry.color ?? seriesColor(index)} />
            ))}
          </Pie>
          <ChartTooltip />
          {showLegend ? (
            <Legend
              verticalAlign="bottom"
              wrapperStyle={{ fontSize: 12, color: "var(--muted-foreground)" }}
            />
          ) : null}
        </PieChart>
      </ResponsiveContainer>

      {centerValue != null || centerLabel != null ? (
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center pb-6">
          {centerValue != null ? (
            <span className="text-2xl font-semibold text-foreground tabular-nums">{centerValue}</span>
          ) : null}
          {centerLabel != null ? (
            <span className="text-xs text-muted-foreground">{centerLabel}</span>
          ) : null}
        </div>
      ) : null}

      <p className="sr-only">{summary}</p>
    </div>
  );
});

export { DonutChartWidget };
