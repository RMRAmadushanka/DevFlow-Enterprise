"use client";

import * as React from "react";

import { ChartCard, DonutChartWidget } from "@/components/dashboard";

import { useDashboardMetrics } from "../hooks/use-dashboard-metrics";

const ProjectStatusChart = React.memo(function ProjectStatusChart() {
  const { data, isLoading, isError, refetch } = useDashboardMetrics();
  const slices = data?.projectStatus ?? [];
  const total = slices.reduce((sum, slice) => sum + slice.value, 0);

  return (
    <ChartCard
      title="Project status"
      description="Distribution across the portfolio"
      summary="Donut chart of active, completed, paused, and archived projects"
      loading={isLoading}
      empty={!isLoading && !isError && slices.length === 0}
      error={isError ? "Could not load project status" : undefined}
      onRetry={() => void refetch()}
    >
      <DonutChartWidget
        data={slices}
        summary="Project status distribution: active, completed, paused, archived"
        centerValue={String(total)}
        centerLabel="Projects"
        height={260}
      />
    </ChartCard>
  );
});

export { ProjectStatusChart };
