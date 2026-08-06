"use client";

import * as React from "react";
import { Zap } from "lucide-react";

import { WidgetCard } from "@/components/dashboard";

import { useVelocityHistory } from "../../hooks/use-sprints";
import { SprintVelocityChart } from "../sprint-velocity-chart";

const VelocityWidget = React.memo(function VelocityWidget() {
  const { data, isLoading, isError, refetch } = useVelocityHistory();

  return (
    <WidgetCard
      title="Velocity"
      description="Committed vs completed across sprints"
      icon={<Zap className="size-4" />}
      loading={isLoading}
      empty={!isLoading && !data?.length}
      error={isError ? "Could not load velocity" : undefined}
      onRetry={() => void refetch()}
    >
      {data?.length ? <SprintVelocityChart data={data} /> : null}
    </WidgetCard>
  );
});

export { VelocityWidget };
