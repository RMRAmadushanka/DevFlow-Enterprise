"use client";

import {
  AreaChartWidget,
  ChartCard,
  LineChartWidget,
} from "@/components/dashboard";

import { useAnalytics, useMetrics } from "../hooks/use-monitoring";
import { formatPercent } from "../utils/format";
import { findMetric, metricPointsToChartData } from "./shared";
import { MetricCard } from "./metric-card";
import { MonitoringEmptyState } from "./monitoring-empty-state";
import { MonitoringSkeleton } from "./monitoring-skeleton";
import { TeamActivityChart } from "./team-activity-chart";

export interface EngineeringDashboardProps {
  className?: string;
}

function EngineeringDashboard({ className }: EngineeringDashboardProps) {
  const { data, isLoading, isError, refetch } = useAnalytics();
  const { data: metrics } = useMetrics();
  const errorRate = findMetric(metrics, "error_rate");
  const availability = findMetric(metrics, "availability");

  if (isLoading) return <MonitoringSkeleton />;
  if (isError || !data) {
    return (
      <MonitoringEmptyState
        variant="no-data"
        action={
          <button
            type="button"
            className="text-sm font-medium text-primary underline"
            onClick={() => void refetch()}
          >
            Retry
          </button>
        }
      />
    );
  }

  return (
    <div className={className ?? "flex flex-col gap-6"} data-slot="engineering-dashboard">
      <h2 className="text-lg font-semibold text-foreground">Engineering dashboard</h2>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard title="Velocity" value={String(data.engineeringVelocity)} />
        <MetricCard
          title="Sprint completion"
          value={formatPercent(data.sprintCompletion)}
        />
        <MetricCard
          title="Error rate"
          value={errorRate ? formatPercent(errorRate.current) : "—"}
          change={errorRate?.trend}
        />
        <MetricCard
          title="Availability"
          value={availability ? formatPercent(availability.current, 2) : "—"}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard title="Velocity trend" summary="Engineering velocity">
          <LineChartWidget
            data={metricPointsToChartData(data.velocityTrend)}
            series={[{ dataKey: "value", name: "Velocity" }]}
            xKey="label"
            height={240}
            showLegend={false}
            summary="Engineering velocity trend"
          />
        </ChartCard>
        <ChartCard title="Error trend" summary="Engineering error trend">
          <AreaChartWidget
            data={metricPointsToChartData(data.errorTrend)}
            series={[{ dataKey: "value", name: "Errors" }]}
            xKey="label"
            height={240}
            showLegend={false}
            summary="Engineering error trend"
          />
        </ChartCard>
      </div>

      <TeamActivityChart />
    </div>
  );
}

export { EngineeringDashboard };
