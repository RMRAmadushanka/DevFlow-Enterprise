"use client";

import * as React from "react";
import { TrendingDown } from "lucide-react";

import { WidgetCard } from "@/components/dashboard";

import { useSprint } from "../../hooks/use-sprints";
import { SprintBurndownChart } from "../sprint-burndown-chart";

const BurndownWidget = React.memo(function BurndownWidget({ sprintId }: { sprintId: string }) {
  const { data, isLoading, isError, refetch } = useSprint(sprintId);

  return (
    <WidgetCard
      title="Burndown"
      description="Remaining story points"
      icon={<TrendingDown className="size-4" />}
      loading={isLoading}
      empty={!isLoading && !data?.burndown.length}
      error={isError ? "Could not load burndown" : undefined}
      onRetry={() => void refetch()}
    >
      {data?.burndown.length ? <SprintBurndownChart data={data.burndown} /> : null}
    </WidgetCard>
  );
});

export { BurndownWidget };
