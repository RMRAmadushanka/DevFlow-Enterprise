"use client";

import * as React from "react";

import { AreaChartWidget, ChartCard } from "@/components/dashboard";

import type { BurnupPoint } from "../types/sprint.types";

export interface SprintBurnupChartProps {
  data: BurnupPoint[];
  loading?: boolean;
  error?: boolean;
  onRetry?: () => void;
  className?: string;
}

const SprintBurnupChart = React.memo(function SprintBurnupChart({
  data,
  loading,
  error,
  onRetry,
  className,
}: SprintBurnupChartProps) {
  const chartData = React.useMemo(
    () =>
      data.map((point) => ({
        label: point.label,
        completed: point.completed,
        scope: point.scope,
      })),
    [data]
  );

  const summary =
    data.length > 0
      ? `Burnup chart showing ${data[data.length - 1]?.completed ?? 0} completed points`
      : "Burnup chart";

  return (
    <ChartCard
      title="Burnup"
      description="Completed work vs total scope"
      loading={loading}
      empty={!loading && data.length === 0}
      error={error ? "Could not load burnup" : undefined}
      onRetry={onRetry}
      summary={summary}
      className={className}
    >
      <AreaChartWidget
        data={chartData}
        xKey="label"
        series={[
          { dataKey: "completed", name: "Completed" },
          { dataKey: "scope", name: "Scope" },
        ]}
        summary={summary}
      />
    </ChartCard>
  );
});

export { SprintBurnupChart };
