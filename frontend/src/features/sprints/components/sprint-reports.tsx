"use client";

import * as React from "react";

import type { SprintDetail } from "../types/sprint.types";
import { CapacityPlanningCard } from "./capacity-planning-card";
import { SprintBurnupChart } from "./sprint-burnup-chart";
import { SprintBurndownChart } from "./sprint-burndown-chart";
import { SprintEmptyState } from "./sprint-empty-state";
import { ReportSkeleton } from "./sprint-skeleton";
import { SprintVelocityChart } from "./sprint-velocity-chart";

export interface SprintReportsProps {
  sprint: SprintDetail;
  velocityData?: Array<{ label: string; committed: number; completed: number }>;
  loading?: boolean;
  className?: string;
}

const SprintReports = React.memo(function SprintReports({
  sprint,
  velocityData,
  loading,
  className,
}: SprintReportsProps) {
  const hasData =
    sprint.burndown.length > 0 ||
    sprint.burnup.length > 0 ||
    (velocityData?.length ?? 0) > 0 ||
    sprint.capacity.length > 0;

  if (loading) {
    return <ReportSkeleton />;
  }

  if (!hasData) {
    return <SprintEmptyState variant="no-reports" />;
  }

  const velocity = velocityData ?? [
    {
      label: sprint.name,
      committed: sprint.metrics.committedPoints,
      completed: sprint.metrics.completedPoints,
    },
  ];

  return (
    <div className={className} data-slot="sprint-reports">
      <div className="grid gap-4 lg:grid-cols-2">
        <SprintBurndownChart data={sprint.burndown} />
        <SprintBurnupChart data={sprint.burnup} />
        <SprintVelocityChart data={velocity} />
        <CapacityPlanningCard
          members={sprint.capacity}
          capacityPoints={sprint.metrics.capacityPoints}
          allocatedPoints={sprint.metrics.committedPoints}
        />
      </div>
    </div>
  );
});

export { SprintReports };
