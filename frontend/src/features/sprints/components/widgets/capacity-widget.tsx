"use client";

import * as React from "react";
import { Users } from "lucide-react";

import { WidgetCard } from "@/components/dashboard";

import { useSprint } from "../../hooks/use-sprints";
import { CapacityPlanningCard } from "../capacity-planning-card";

const CapacityWidget = React.memo(function CapacityWidget({ sprintId }: { sprintId: string }) {
  const { data, isLoading, isError, refetch } = useSprint(sprintId);

  const overCapacity =
    data && data.metrics.committedPoints > data.metrics.capacityPoints;

  return (
    <WidgetCard
      title="Team capacity"
      description={
        overCapacity
          ? "Team is over allocated"
          : "Member allocation vs capacity"
      }
      icon={<Users className="size-4" />}
      loading={isLoading}
      empty={!isLoading && !data?.capacity.length}
      error={isError ? "Could not load capacity" : undefined}
      onRetry={() => void refetch()}
    >
      {data?.capacity.length ? (
        <CapacityPlanningCard
          members={data.capacity}
          capacityPoints={data.metrics.capacityPoints}
          allocatedPoints={data.metrics.committedPoints}
        />
      ) : null}
    </WidgetCard>
  );
});

export { CapacityWidget };
