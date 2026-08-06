"use client";

import { LineChartWidget, WidgetCard } from "@/components/dashboard";

import { useAnalytics } from "../../hooks/use-monitoring";
import { formatPercent } from "../../utils/format";
import { metricPointsToChartData } from "../shared";

const DeploymentMetricsWidget = function DeploymentMetricsWidget() {
  const { data, isLoading, isError, refetch } = useAnalytics();
  const points = data?.deploymentTrend ?? [];

  return (
    <WidgetCard
      title="Deployment metrics"
      description={
        data
          ? `Success rate ${formatPercent(data.deploymentSuccessRate)}`
          : undefined
      }
      loading={isLoading}
      error={isError ? "Could not load deployments" : undefined}
      onRetry={() => void refetch()}
      empty={points.length === 0}
    >
      {points.length > 0 ? (
        <LineChartWidget
          data={metricPointsToChartData(points)}
          series={[{ dataKey: "value", name: "Deploys" }]}
          xKey="label"
          height={180}
          showLegend={false}
          summary="Deployment metrics over time"
        />
      ) : null}
    </WidgetCard>
  );
};

export { DeploymentMetricsWidget };
