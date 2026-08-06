"use client";

import * as React from "react";

import { AreaChartWidget, ChartCard } from "@/components/dashboard";

import type { BurndownPoint } from "../types/sprint.types";

export interface SprintBurndownChartProps {
  data: BurndownPoint[];
  loading?: boolean;
  error?: boolean;
  onRetry?: () => void;
  className?: string;
}

const SprintBurndownChart = React.memo(function SprintBurndownChart({
  data,
  loading,
  error,
  onRetry,
  className,
}: SprintBurndownChartProps) {
  const chartData = React.useMemo(
    () => data.map((point) => ({ label: point.label, remaining: point.remaining, ideal: point.ideal })),
    [data]
  );

  const summary =
    data.length > 0
      ? `Burndown chart showing ${data[data.length - 1]?.remaining ?? 0} remaining points`
      : "Burndown chart";

  return (
    <ChartCard
      title="Burndown"
      description="Remaining story points vs ideal trend"
      loading={loading}
      empty={!loading && data.length === 0}
      error={error ? "Could not load burndown" : undefined}
      onRetry={onRetry}
      summary={summary}
      className={className}
    >
      <AreaChartWidget
        data={chartData}
        xKey="label"
        series={[
          { dataKey: "remaining", name: "Remaining" },
          { dataKey: "ideal", name: "Ideal" },
        ]}
        summary={summary}
      />
    </ChartCard>
  );
});

export { SprintBurndownChart };
