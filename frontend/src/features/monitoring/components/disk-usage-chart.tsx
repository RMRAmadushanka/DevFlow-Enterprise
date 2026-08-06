"use client";

import { useMetrics } from "../hooks/use-monitoring";
import { findMetric } from "./shared";
import { MetricChart } from "./metric-chart";

export interface DiskUsageChartProps {
  className?: string;
}

function DiskUsageChart({ className }: DiskUsageChartProps) {
  const { data, isLoading, isError, refetch } = useMetrics();
  return (
    <MetricChart
      metric={findMetric(data, "disk")}
      title="Disk usage"
      variant="bar"
      loading={isLoading}
      error={isError}
      onRetry={() => void refetch()}
      className={className}
    />
  );
}

export { DiskUsageChart };
