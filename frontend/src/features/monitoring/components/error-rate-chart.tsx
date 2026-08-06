"use client";

import { useMetrics } from "../hooks/use-monitoring";
import { findMetric } from "./shared";
import { MetricChart } from "./metric-chart";

export interface ErrorRateChartProps {
  className?: string;
}

function ErrorRateChart({ className }: ErrorRateChartProps) {
  const { data, isLoading, isError, refetch } = useMetrics();
  return (
    <MetricChart
      metric={findMetric(data, "error_rate")}
      title="Error rate"
      variant="area"
      loading={isLoading}
      error={isError}
      onRetry={() => void refetch()}
      className={className}
    />
  );
}

export { ErrorRateChart };
