"use client";

import * as React from "react";
import {
  Legend,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from "recharts";

import { cn } from "@/lib/utils";
import { seriesColor } from "@/components/dashboard/shared/chart-theme";
import { ChartTooltip } from "./chart-tooltip";
import type { RadarChartWidgetProps } from "./types";

/**
 * Radar chart for multi-axis comparisons (skills, performance dimensions).
 */
const RadarChartWidget = React.memo(function RadarChartWidget({
  data,
  series,
  angleKey,
  height = 280,
  showLegend = true,
  className,
  summary,
}: RadarChartWidgetProps) {
  return (
    <div
      data-slot="radar-chart-widget"
      className={cn("w-full", className)}
      style={{ height }}
      role="img"
      aria-label={summary}
    >
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} cx="50%" cy="50%" outerRadius="70%">
          <PolarGrid stroke="var(--border)" />
          <PolarAngleAxis
            dataKey={angleKey}
            tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
          />
          <PolarRadiusAxis
            tick={{ fill: "var(--muted-foreground)", fontSize: 10 }}
            axisLine={false}
          />
          <ChartTooltip />
          {showLegend ? (
            <Legend wrapperStyle={{ fontSize: 12, color: "var(--muted-foreground)" }} />
          ) : null}
          {series.map((s, index) => (
            <Radar
              key={s.dataKey}
              name={s.name}
              dataKey={s.dataKey}
              stroke={s.color ?? seriesColor(index)}
              fill={s.color ?? seriesColor(index)}
              fillOpacity={0.2}
              strokeWidth={2}
              isAnimationActive
            />
          ))}
        </RadarChart>
      </ResponsiveContainer>
      <p className="sr-only">{summary}</p>
    </div>
  );
});

export { RadarChartWidget };
