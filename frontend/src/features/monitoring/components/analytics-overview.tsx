"use client";

import {
  AreaChartWidget,
  ChartCard,
  LineChartWidget,
} from "@/components/dashboard";
import { StatusBadge } from "@/components/data-display/badges";

import { HEALTH_LABELS } from "../constants/monitoring.constants";
import { useAnalytics } from "../hooks/use-monitoring";
import type { AnalyticsOverview as AnalyticsOverviewData } from "../types/monitoring.types";
import { formatPercent } from "../utils/format";
import { HEALTH_TONE, metricPointsToChartData } from "./shared";
import { MetricCard } from "./metric-card";
import { MonitoringEmptyState } from "./monitoring-empty-state";
import { MonitoringSkeleton } from "./monitoring-skeleton";

export interface AnalyticsOverviewProps {
  data?: AnalyticsOverviewData;
  loading?: boolean;
  className?: string;
}

function AnalyticsOverviewView({ data, loading, className }: AnalyticsOverviewProps) {
  return (
    <div className={className ?? "flex flex-col gap-6"} data-slot="analytics-overview">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Engineering velocity"
          value={data ? `${data.engineeringVelocity}` : "—"}
          loading={loading}
          description="Story points / sprint"
        />
        <MetricCard
          title="Deploy success"
          value={data ? formatPercent(data.deploymentSuccessRate) : "—"}
          loading={loading}
          variant={
            data && data.deploymentSuccessRate < 90
              ? "warning"
              : data && data.deploymentSuccessRate >= 95
                ? "success"
                : "default"
          }
        />
        <MetricCard
          title="Open incidents"
          value={data ? String(data.openIncidents) : "—"}
          loading={loading}
          variant={data && data.openIncidents > 0 ? "danger" : "success"}
        />
        <MetricCard
          title="Team utilization"
          value={data ? formatPercent(data.teamUtilization) : "—"}
          loading={loading}
        />
      </div>

      {data ? (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted-foreground">Platform health</span>
          <StatusBadge tone={HEALTH_TONE[data.platformHealth]} size="sm" dot>
            {HEALTH_LABELS[data.platformHealth]}
          </StatusBadge>
          <span className="text-sm text-muted-foreground">
            · Sprint completion {formatPercent(data.sprintCompletion)} · Repo activity{" "}
            {data.repoActivity}
          </span>
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-3">
        <ChartCard
          title="Error trend"
          loading={loading}
          empty={!data?.errorTrend?.length}
          summary="Error trend over time"
        >
          {data?.errorTrend?.length ? (
            <AreaChartWidget
              data={metricPointsToChartData(data.errorTrend)}
              series={[{ dataKey: "value", name: "Errors" }]}
              xKey="label"
              height={220}
              showLegend={false}
              summary="Error trend area chart"
            />
          ) : null}
        </ChartCard>
        <ChartCard
          title="Deployment trend"
          loading={loading}
          empty={!data?.deploymentTrend?.length}
          summary="Deployment trend over time"
        >
          {data?.deploymentTrend?.length ? (
            <LineChartWidget
              data={metricPointsToChartData(data.deploymentTrend)}
              series={[{ dataKey: "value", name: "Deploys" }]}
              xKey="label"
              height={220}
              showLegend={false}
              summary="Deployment trend line chart"
            />
          ) : null}
        </ChartCard>
        <ChartCard
          title="Velocity trend"
          loading={loading}
          empty={!data?.velocityTrend?.length}
          summary="Velocity trend over time"
        >
          {data?.velocityTrend?.length ? (
            <LineChartWidget
              data={metricPointsToChartData(data.velocityTrend)}
              series={[{ dataKey: "value", name: "Velocity" }]}
              xKey="label"
              height={220}
              showLegend={false}
              summary="Velocity trend line chart"
            />
          ) : null}
        </ChartCard>
      </div>
    </div>
  );
}

/** Loads analytics and renders the full overview. */
function AnalyticsOverview({ className }: { className?: string }) {
  const { data, isLoading, isError, refetch } = useAnalytics();

  if (isLoading) return <MonitoringSkeleton />;
  if (isError) {
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

  return <AnalyticsOverviewView data={data} className={className} />;
}

export { AnalyticsOverview, AnalyticsOverviewView };
