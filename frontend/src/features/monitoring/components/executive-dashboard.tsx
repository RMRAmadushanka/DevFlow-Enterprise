"use client";

import {
  AreaChartWidget,
  ChartCard,
  DonutChartWidget,
  LineChartWidget,
} from "@/components/dashboard";
import { StatusBadge } from "@/components/data-display/badges";

import { HEALTH_LABELS } from "../constants/monitoring.constants";
import { useAnalytics } from "../hooks/use-monitoring";
import { formatPercent } from "../utils/format";
import { HEALTH_TONE, metricPointsToChartData } from "./shared";
import { MetricCard } from "./metric-card";
import { MonitoringEmptyState } from "./monitoring-empty-state";
import { MonitoringSkeleton } from "./monitoring-skeleton";

export interface ExecutiveDashboardProps {
  className?: string;
}

function ExecutiveDashboard({ className }: ExecutiveDashboardProps) {
  const { data, isLoading, isError, refetch } = useAnalytics();

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
    <div className={className ?? "flex flex-col gap-6"} data-slot="executive-dashboard">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="text-lg font-semibold text-foreground">Executive overview</h2>
        <StatusBadge tone={HEALTH_TONE[data.platformHealth]} size="sm" dot>
          {HEALTH_LABELS[data.platformHealth]}
        </StatusBadge>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Project success"
          value={formatPercent(data.projectSuccessRate)}
          variant={data.projectSuccessRate >= 85 ? "success" : "warning"}
        />
        <MetricCard
          title="Team utilization"
          value={formatPercent(data.teamUtilization)}
        />
        <MetricCard
          title="Open incidents"
          value={String(data.openIncidents)}
          variant={data.openIncidents > 0 ? "danger" : "success"}
        />
        <MetricCard
          title="Deploy success"
          value={formatPercent(data.deploymentSuccessRate)}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard title="Delivery velocity" summary="Velocity trend for executives">
          <LineChartWidget
            data={metricPointsToChartData(data.velocityTrend)}
            series={[{ dataKey: "value", name: "Velocity" }]}
            xKey="label"
            height={240}
            showLegend={false}
            summary="Executive velocity trend"
          />
        </ChartCard>
        <ChartCard title="Deployment volume" summary="Deployment trend for executives">
          <AreaChartWidget
            data={metricPointsToChartData(data.deploymentTrend)}
            series={[{ dataKey: "value", name: "Deploys" }]}
            xKey="label"
            height={240}
            showLegend={false}
            summary="Executive deployment trend"
          />
        </ChartCard>
        <ChartCard
          title="Reliability mix"
          summary="Incidents vs success indicators"
          className="lg:col-span-2"
        >
          <DonutChartWidget
            data={[
              { name: "Successful projects", value: Math.round(data.projectSuccessRate) },
              { name: "At risk", value: Math.max(0, 100 - Math.round(data.projectSuccessRate)) },
            ]}
            centerValue={formatPercent(data.projectSuccessRate, 0)}
            centerLabel="Success"
            height={220}
            summary="Project success distribution"
          />
        </ChartCard>
      </div>
    </div>
  );
}

export { ExecutiveDashboard };
