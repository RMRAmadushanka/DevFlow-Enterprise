"use client";

import * as React from "react";

import { AreaChartWidget, ChartCard } from "@/components/dashboard";

import { useDashboardMetrics } from "../hooks/use-dashboard-metrics";

const SprintBurndownChart = React.memo(function SprintBurndownChart() {
  const { data, isLoading, isError, refetch } = useDashboardMetrics();
  const rows = data?.burndown ?? [];

  return (
    <ChartCard
      title="Sprint burndown"
      description="Remaining work versus ideal"
      summary="Area chart of remaining sprint work over time"
      loading={isLoading}
      empty={!isLoading && !isError && rows.length === 0}
      error={isError ? "Could not load burndown" : undefined}
      onRetry={() => void refetch()}
    >
      <AreaChartWidget
        data={rows}
        xKey="label"
        series={[
          { dataKey: "remaining", name: "Remaining" },
          { dataKey: "ideal", name: "Ideal" },
        ]}
        summary="Sprint burndown remaining work compared to ideal line"
        height={260}
      />
    </ChartCard>
  );
});

export { SprintBurndownChart };
