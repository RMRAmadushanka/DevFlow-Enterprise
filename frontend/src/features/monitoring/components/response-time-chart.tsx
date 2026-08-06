"use client";

import { formatMs } from "../utils/format";
import { useMetrics } from "../hooks/use-monitoring";
import { findMetric } from "./shared";
import { MetricChart } from "./metric-chart";

export interface ResponseTimeChartProps {
  className?: string;
}

function ResponseTimeChart({ className }: ResponseTimeChartProps) {
  const { data, isLoading, isError, refetch } = useMetrics();
  return (
    <MetricChart
      metric={findMetric(data, "response_time")}
      title="Response time"
      variant="line"
      loading={isLoading}
      error={isError}
      onRetry={() => void refetch()}
      className={className}
      valueFormatter={formatMs}
    />
  );
}

export { ResponseTimeChart };
