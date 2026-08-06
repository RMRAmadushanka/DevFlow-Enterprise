"use client";

import { WidgetCard } from "@/components/dashboard";
import { StatusBadge } from "@/components/data-display/badges";

import { HEALTH_LABELS } from "../../constants/monitoring.constants";
import { useMonitoring } from "../../hooks/use-monitoring";
import { formatPercent } from "../../utils/format";
import { HEALTH_TONE } from "../shared";

const SystemHealthWidget = function SystemHealthWidget() {
  const { data, isLoading, isError, refetch } = useMonitoring();
  const system = data?.system;

  return (
    <WidgetCard
      title="System health"
      loading={isLoading}
      error={isError ? "Could not load health" : undefined}
      onRetry={() => void refetch()}
      empty={!system}
      actions={
        system ? (
          <StatusBadge tone={HEALTH_TONE[system.overall]} size="sm" dot>
            {HEALTH_LABELS[system.overall]}
          </StatusBadge>
        ) : undefined
      }
    >
      {system ? (
        <div className="flex flex-col gap-2 text-sm">
          <p className="text-2xl font-semibold tabular-nums text-foreground">
            {formatPercent(system.availability, 2)}
          </p>
          <p className="text-muted-foreground">
            CPU {formatPercent(system.cpu)} · Mem {formatPercent(system.memory)} · Disk{" "}
            {formatPercent(system.disk)}
          </p>
        </div>
      ) : null}
    </WidgetCard>
  );
};

export { SystemHealthWidget };
