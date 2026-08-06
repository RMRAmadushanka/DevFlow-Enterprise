"use client";

import { Activity, Cpu, HardDrive, MemoryStick, Network } from "lucide-react";

import { StatusBadge } from "@/components/data-display/badges";
import { GaugeChart, WidgetCard } from "@/components/dashboard";

import { HEALTH_LABELS } from "../constants/monitoring.constants";
import type { SystemHealth } from "../types/monitoring.types";
import { formatPercent, formatTimestamp } from "../utils/format";
import { HEALTH_TONE } from "./shared";
import { MetricCard } from "./metric-card";

export interface SystemHealthCardProps {
  system?: SystemHealth;
  loading?: boolean;
  error?: boolean;
  onRetry?: () => void;
  className?: string;
}

function SystemHealthCard({
  system,
  loading,
  error,
  onRetry,
  className,
}: SystemHealthCardProps) {
  return (
    <WidgetCard
      title="System health"
      description={
        system ? `Updated ${formatTimestamp(system.lastUpdated)}` : undefined
      }
      loading={loading}
      error={error ? "Could not load system health" : undefined}
      onRetry={onRetry}
      empty={!loading && !error && !system}
      className={className}
      actions={
        system ? (
          <StatusBadge tone={HEALTH_TONE[system.overall]} size="sm" dot>
            {HEALTH_LABELS[system.overall]}
          </StatusBadge>
        ) : undefined
      }
    >
      {system ? (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col items-center gap-2 sm:flex-row sm:justify-between">
            <GaugeChart
              value={system.availability}
              label={formatPercent(system.availability, 2)}
              description="Availability"
              thresholds={{ warning: 99, danger: 95 }}
              size={160}
              summary={`System availability ${formatPercent(system.availability, 2)}`}
            />
            <div className="grid w-full flex-1 gap-3 sm:grid-cols-2">
              <MetricCard
                title="CPU"
                value={formatPercent(system.cpu)}
                icon={<Cpu className="size-4" />}
                variant={system.cpu >= 85 ? "danger" : system.cpu >= 70 ? "warning" : "default"}
              />
              <MetricCard
                title="Memory"
                value={formatPercent(system.memory)}
                icon={<MemoryStick className="size-4" />}
                variant={
                  system.memory >= 85 ? "danger" : system.memory >= 70 ? "warning" : "default"
                }
              />
              <MetricCard
                title="Disk"
                value={formatPercent(system.disk)}
                icon={<HardDrive className="size-4" />}
                variant={system.disk >= 85 ? "danger" : system.disk >= 70 ? "warning" : "default"}
              />
              <MetricCard
                title="Network"
                value={`${system.networkMbps} Mbps`}
                icon={<Network className="size-4" />}
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-3 text-sm">
            <div className="flex items-center gap-2">
              <Activity className="size-4 text-muted-foreground" />
              <span className="text-muted-foreground">API</span>
              <StatusBadge tone={HEALTH_TONE[system.apiStatus]} size="sm" dot>
                {HEALTH_LABELS[system.apiStatus]}
              </StatusBadge>
            </div>
            <div className="flex items-center gap-2">
              <HardDrive className="size-4 text-muted-foreground" />
              <span className="text-muted-foreground">Database</span>
              <StatusBadge tone={HEALTH_TONE[system.databaseStatus]} size="sm" dot>
                {HEALTH_LABELS[system.databaseStatus]}
              </StatusBadge>
            </div>
          </div>
        </div>
      ) : null}
    </WidgetCard>
  );
}

export { SystemHealthCard };
