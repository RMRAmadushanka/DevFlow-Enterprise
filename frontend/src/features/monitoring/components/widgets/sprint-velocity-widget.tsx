"use client";

import { LineChartWidget, WidgetCard } from "@/components/dashboard";

import { useAnalytics } from "../../hooks/use-monitoring";
import { formatPercent } from "../../utils/format";
import { metricPointsToChartData } from "../shared";

const SprintVelocityWidget = function SprintVelocityWidget() {
  const { data, isLoading, isError, refetch } = useAnalytics();
  const points = data?.velocityTrend ?? [];

  return (
    <WidgetCard
      title="Sprint velocity"
      description={
        data
          ? `${data.engineeringVelocity} pts · ${formatPercent(data.sprintCompletion)} complete`
          : undefined
      }
      loading={isLoading}
      error={isError ? "Could not load velocity" : undefined}
      onRetry={() => void refetch()}
      empty={points.length === 0}
    >
      {points.length > 0 ? (
        <LineChartWidget
          data={metricPointsToChartData(points)}
          series={[{ dataKey: "value", name: "Velocity" }]}
          xKey="label"
          height={180}
          showLegend={false}
          summary="Sprint velocity trend"
        />
      ) : null}
    </WidgetCard>
  );
};

export { SprintVelocityWidget };
