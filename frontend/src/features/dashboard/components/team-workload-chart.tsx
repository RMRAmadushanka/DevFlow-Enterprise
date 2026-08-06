"use client";

import * as React from "react";

import { BarChartWidget, ChartCard } from "@/components/dashboard";

import { useDashboardMetrics } from "../hooks/use-dashboard-metrics";

const TeamWorkloadChart = React.memo(function TeamWorkloadChart() {
  const { data, isLoading, isError, refetch } = useDashboardMetrics();
  const rows = (data?.workload ?? []).map((member) => ({
    label: member.name.split(" ")[0] ?? member.name,
    assigned: member.assignedTasks,
    completed: member.completedTasks,
    capacity: member.capacity,
  }));

  return (
    <ChartCard
      title="Workload chart"
      description="Assigned vs completed by teammate"
      summary="Bar chart of team workload"
      loading={isLoading}
      empty={!isLoading && !isError && rows.length === 0}
      error={isError ? "Could not load workload chart" : undefined}
      onRetry={() => void refetch()}
    >
      <BarChartWidget
        data={rows}
        xKey="label"
        series={[
          { dataKey: "assigned", name: "Assigned" },
          { dataKey: "completed", name: "Completed" },
        ]}
        summary="Assigned and completed tasks by team member"
        height={260}
      />
    </ChartCard>
  );
});

export { TeamWorkloadChart };
