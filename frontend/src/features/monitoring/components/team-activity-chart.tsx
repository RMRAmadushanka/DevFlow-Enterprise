"use client";

import { BarChartWidget, ChartCard } from "@/components/dashboard";

import { useUserActivity } from "../hooks/use-monitoring";
import { MetricChartSkeleton } from "./monitoring-skeleton";

export interface TeamActivityChartProps {
  className?: string;
}

function TeamActivityChart({ className }: TeamActivityChartProps) {
  const { data, isLoading, isError, refetch } = useUserActivity();

  if (isLoading) return <MetricChartSkeleton />;

  const chartData =
    data?.map((row) => ({
      label: row.userName.split(" ")[0] ?? row.userName,
      projects: row.projectActions,
      tasks: row.taskActions,
      deploys: row.deploymentActions,
      docs: row.documentActions,
    })) ?? [];

  return (
    <ChartCard
      title="Team activity"
      description="Actions by user across projects, tasks, deploys, and docs"
      error={isError ? "Could not load team activity" : undefined}
      onRetry={() => void refetch()}
      empty={chartData.length === 0}
      className={className}
      summary="Team activity by user"
      height={300}
    >
      {chartData.length > 0 ? (
        <BarChartWidget
          data={chartData}
          series={[
            { dataKey: "projects", name: "Projects" },
            { dataKey: "tasks", name: "Tasks" },
            { dataKey: "deploys", name: "Deploys" },
            { dataKey: "docs", name: "Docs" },
          ]}
          xKey="label"
          height={280}
          stacked
          summary="Stacked bar chart of team activity by user"
        />
      ) : null}
    </ChartCard>
  );
}

export { TeamActivityChart };
