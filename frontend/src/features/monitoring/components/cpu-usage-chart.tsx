"use client";

import { useMetrics } from "../hooks/use-monitoring";
import { findMetric } from "./shared";
import { MetricChart } from "./metric-chart";

export interface CpuUsageChartProps {
  className?: string;
}

function CpuUsageChart({ className }: CpuUsageChartProps) {
  const { data, isLoading, isError, refetch } = useMetrics();
  return (
    <MetricChart
      metric={findMetric(data, "cpu")}
      title="CPU usage"
      variant="area"
      loading={isLoading}
      error={isError}
      onRetry={() => void refetch()}
      className={className}
    />
  );
}

export { CpuUsageChart };
