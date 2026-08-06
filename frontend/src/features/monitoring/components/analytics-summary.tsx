"use client";

import { StatusBadge } from "@/components/data-display/badges";
import { WidgetCard } from "@/components/dashboard";

import { HEALTH_LABELS } from "../constants/monitoring.constants";
import { useAnalytics } from "../hooks/use-monitoring";
import type { AnalyticsOverview as AnalyticsOverviewData } from "../types/monitoring.types";
import { formatPercent } from "../utils/format";
import { HEALTH_TONE } from "./shared";
import { MetricCard } from "./metric-card";

export interface AnalyticsSummaryProps {
  data?: AnalyticsOverviewData;
  loading?: boolean;
  className?: string;
}

function AnalyticsSummaryView({ data, loading, className }: AnalyticsSummaryProps) {
  return (
    <WidgetCard
      title="Analytics summary"
      description="Key delivery and reliability signals"
      loading={loading}
      empty={!loading && !data}
      className={className}
      actions={
        data ? (
          <StatusBadge tone={HEALTH_TONE[data.platformHealth]} size="sm" dot>
            {HEALTH_LABELS[data.platformHealth]}
          </StatusBadge>
        ) : undefined
      }
    >
      {data ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <MetricCard title="Velocity" value={String(data.engineeringVelocity)} />
          <MetricCard
            title="Deploy success"
            value={formatPercent(data.deploymentSuccessRate)}
          />
          <MetricCard title="Open incidents" value={String(data.openIncidents)} />
          <MetricCard
            title="Project success"
            value={formatPercent(data.projectSuccessRate)}
          />
          <MetricCard
            title="Sprint completion"
            value={formatPercent(data.sprintCompletion)}
          />
          <MetricCard title="Repo activity" value={String(data.repoActivity)} />
        </div>
      ) : null}
    </WidgetCard>
  );
}

/** Hook-backed compact analytics summary. */
function AnalyticsSummary({ className }: { className?: string }) {
  const { data, isLoading } = useAnalytics();
  return <AnalyticsSummaryView data={data} loading={isLoading} className={className} />;
}

export { AnalyticsSummary, AnalyticsSummaryView };
