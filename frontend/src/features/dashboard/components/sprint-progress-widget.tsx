"use client";

import * as React from "react";

import { ProgressWidget, WidgetCard } from "@/components/dashboard";

import { useDashboardMetrics } from "../hooks/use-dashboard-metrics";

const SprintProgressWidget = React.memo(function SprintProgressWidget() {
  const { data, isLoading, isError, refetch } = useDashboardMetrics();
  const sprint = data?.sprint ?? null;

  if (!isLoading && !isError && !sprint) {
    return (
      <WidgetCard title="Sprint progress" empty description="No active sprint in this filter" />
    );
  }

  return (
    <ProgressWidget
      title={sprint?.name ?? "Sprint progress"}
      value={sprint?.completionPercent ?? 0}
      description={
        sprint
          ? `${sprint.remainingDays} days remaining · ${sprint.tasksCompleted} completed · ${sprint.tasksRemaining} remaining`
          : undefined
      }
      currentLabel={sprint ? `${sprint.completionPercent}% complete` : undefined}
      goal="Sprint goal"
      loading={isLoading}
      error={isError ? "Could not load sprint" : undefined}
      onRetry={() => void refetch()}
    />
  );
});

export { SprintProgressWidget };
