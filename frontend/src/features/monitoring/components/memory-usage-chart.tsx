"use client";

import { useMetrics } from "../hooks/use-monitoring";
import { findMetric } from "./shared";
import { MetricChart } from "./metric-chart";

export interface MemoryUsageChartProps {
  className?: string;
}

function MemoryUsageChart({ className }: MemoryUsageChartProps) {
  const { data, isLoading, isError, refetch } = useMetrics();
  return (
    <MetricChart
      metric={findMetric(data, "memory")}
      title="Memory usage"
      variant="area"
      loading={isLoading}
      error={isError}
      onRetry={() => void refetch()}
      className={className}
    />
  );
}

export { MemoryUsageChart };
