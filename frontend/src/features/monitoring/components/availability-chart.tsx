"use client";

import { GaugeChart, ChartCard } from "@/components/dashboard";

import { formatPercent } from "../utils/format";
import { useMetrics } from "../hooks/use-monitoring";
import { findMetric } from "./shared";
import { MetricChartSkeleton } from "./monitoring-skeleton";

export interface AvailabilityChartProps {
  className?: string;
}

function AvailabilityChart({ className }: AvailabilityChartProps) {
  const { data, isLoading, isError, refetch } = useMetrics();
  const metric = findMetric(data, "availability");

  if (isLoading) return <MetricChartSkeleton />;

  return (
    <ChartCard
      title="Availability"
      description={metric ? `Current: ${formatPercent(metric.current, 2)}` : undefined}
      error={isError ? "Could not load availability" : undefined}
      onRetry={() => void refetch()}
      empty={!metric}
      className={className}
      summary={
        metric
          ? `Availability ${formatPercent(metric.current, 2)}`
          : "Availability chart"
      }
    >
      {metric ? (
        <div className="flex justify-center py-2">
          <GaugeChart
            value={metric.current}
            label={formatPercent(metric.current, 2)}
            description="Uptime"
            thresholds={{ warning: 99, danger: 95 }}
            summary={`Availability ${formatPercent(metric.current, 2)}`}
          />
        </div>
      ) : null}
    </ChartCard>
  );
}

export { AvailabilityChart };
