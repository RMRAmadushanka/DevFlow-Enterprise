"use client";

import * as React from "react";
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";

import { cn } from "@/lib/utils";
import { CHART_STATUS } from "@/components/dashboard/shared/chart-theme";
import type { GaugeChartProps } from "./types";

function resolveTone(value: number, warning: number, danger: number): string {
  if (value <= danger) return CHART_STATUS.danger;
  if (value <= warning) return CHART_STATUS.warning;
  return CHART_STATUS.success;
}

/**
 * Semi-circle gauge for health scores and availability percentages.
 */
const GaugeChart = React.memo(function GaugeChart({
  value,
  label,
  description,
  min = 0,
  max = 100,
  thresholds = { warning: 80, danger: 50 },
  size = 200,
  className,
  summary,
}: GaugeChartProps) {
  const clamped = Math.min(max, Math.max(min, value));
  const pct = ((clamped - min) / (max - min)) * 100;
  const tone = resolveTone(pct, thresholds.warning, thresholds.danger);
  const data = [
    { name: "value", value: pct },
    { name: "rest", value: 100 - pct },
  ];
  const accessible = summary ?? `${label ?? "Gauge"}: ${Math.round(pct)} percent`;

  return (
    <div
      data-slot="gauge-chart"
      className={cn("flex flex-col items-center gap-1", className)}
      style={{ width: size }}
      role="img"
      aria-label={accessible}
    >
      <div className="relative w-full" style={{ height: size * 0.55 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              startAngle={180}
              endAngle={0}
              innerRadius="70%"
              outerRadius="100%"
              dataKey="value"
              stroke="none"
              isAnimationActive
            >
              <Cell fill={tone} />
              <Cell fill="var(--muted)" />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-1">
          <span className="text-2xl font-semibold text-foreground tabular-nums">
            {Math.round(pct)}%
          </span>
        </div>
      </div>
      {label ? <p className="text-sm font-medium text-foreground">{label}</p> : null}
      {description ? <p className="text-xs text-muted-foreground">{description}</p> : null}
      <p className="sr-only">{accessible}</p>
    </div>
  );
});

export { GaugeChart };
