"use client";

import * as React from "react";

import { ChartCard, LineChartWidget } from "@/components/dashboard";

import { useDashboardMetrics } from "../hooks/use-dashboard-metrics";

const DeploymentTrendChart = React.memo(function DeploymentTrendChart() {
  const { data, isLoading, isError, refetch } = useDashboardMetrics();
  const rows = data?.deploymentTrend ?? [];

  return (
    <ChartCard
      title="Deployment trend"
      description="Deployments over the selected period"
      summary="Line chart of deployments and failures over time"
      loading={isLoading}
      empty={!isLoading && !isError && rows.length === 0}
      error={isError ? "Could not load deployment trend" : undefined}
      onRetry={() => void refetch()}
    >
      <LineChartWidget
        data={rows}
        xKey="label"
        series={[
          { dataKey: "deployments", name: "Deployments" },
          { dataKey: "failures", name: "Failures" },
        ]}
        summary="Deployments and failures over the last week"
        height={260}
      />
    </ChartCard>
  );
});

export { DeploymentTrendChart };
