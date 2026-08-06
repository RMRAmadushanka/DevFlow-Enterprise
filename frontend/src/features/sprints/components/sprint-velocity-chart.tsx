"use client";

import * as React from "react";

import { BarChartWidget, ChartCard } from "@/components/dashboard";

import type { VelocityPoint } from "../types/sprint.types";

export interface SprintVelocityChartProps {
  data: VelocityPoint[];
  loading?: boolean;
  error?: boolean;
  onRetry?: () => void;
  className?: string;
}

const SprintVelocityChart = React.memo(function SprintVelocityChart({
  data,
  loading,
  error,
  onRetry,
  className,
}: SprintVelocityChartProps) {
  const chartData = React.useMemo(
    () =>
      data.map((point) => ({
        label: point.label,
        committed: point.committed,
        completed: point.completed,
      })),
    [data]
  );

  const summary =
    data.length > 0
      ? `Velocity chart across ${data.length} sprints`
      : "Velocity chart";

  return (
    <ChartCard
      title="Velocity"
      description="Committed vs completed story points"
      loading={loading}
      empty={!loading && data.length === 0}
      error={error ? "Could not load velocity" : undefined}
      onRetry={onRetry}
      summary={summary}
      className={className}
    >
      <BarChartWidget
        data={chartData}
        xKey="label"
        series={[
          { dataKey: "committed", name: "Committed" },
          { dataKey: "completed", name: "Completed" },
        ]}
        summary={summary}
      />
    </ChartCard>
  );
});

export { SprintVelocityChart };
