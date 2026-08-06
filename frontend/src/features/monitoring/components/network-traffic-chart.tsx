"use client";

import { useMetrics } from "../hooks/use-monitoring";
import { findMetric } from "./shared";
import { MetricChart } from "./metric-chart";

export interface NetworkTrafficChartProps {
  className?: string;
}

function NetworkTrafficChart({ className }: NetworkTrafficChartProps) {
  const { data, isLoading, isError, refetch } = useMetrics();
  return (
    <MetricChart
      metric={findMetric(data, "network")}
      title="Network traffic"
      variant="line"
      loading={isLoading}
      error={isError}
      onRetry={() => void refetch()}
      className={className}
      seriesOverride={[
        { dataKey: "value", name: "Inbound" },
        { dataKey: "secondary", name: "Outbound" },
      ]}
      showLegend
    />
  );
}

export { NetworkTrafficChart };
