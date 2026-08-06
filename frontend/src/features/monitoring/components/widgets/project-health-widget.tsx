"use client";

import { GaugeChart, WidgetCard } from "@/components/dashboard";

import { useAnalytics } from "../../hooks/use-monitoring";
import { formatPercent } from "../../utils/format";

const ProjectHealthWidget = function ProjectHealthWidget() {
  const { data, isLoading, isError, refetch } = useAnalytics();

  return (
    <WidgetCard
      title="Project health"
      loading={isLoading}
      error={isError ? "Could not load project health" : undefined}
      onRetry={() => void refetch()}
      empty={!data}
    >
      {data ? (
        <div className="flex flex-col items-center gap-2">
          <GaugeChart
            value={data.projectSuccessRate}
            label={formatPercent(data.projectSuccessRate)}
            description="Success rate"
            thresholds={{ warning: 80, danger: 60 }}
            size={160}
            summary={`Project success ${formatPercent(data.projectSuccessRate)}`}
          />
          <p className="text-sm text-muted-foreground">
            Utilization {formatPercent(data.teamUtilization)}
          </p>
        </div>
      ) : null}
    </WidgetCard>
  );
};

export { ProjectHealthWidget };
