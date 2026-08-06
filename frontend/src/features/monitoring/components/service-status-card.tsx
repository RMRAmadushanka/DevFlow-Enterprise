"use client";

import { StatusBadge } from "@/components/data-display/badges";
import { cn } from "@/lib/utils";

import { HEALTH_LABELS, SERVICE_LABELS } from "../constants/monitoring.constants";
import type { ServiceHealth } from "../types/monitoring.types";
import { formatMs, formatPercent, formatTimestamp } from "../utils/format";
import { HEALTH_TONE } from "./shared";

export interface ServiceStatusCardProps {
  service: ServiceHealth;
  onClick?: (service: ServiceHealth) => void;
  className?: string;
}

function ServiceStatusCard({ service, onClick, className }: ServiceStatusCardProps) {
  const interactive = Boolean(onClick);

  return (
    <button
      type="button"
      disabled={!interactive}
      onClick={() => onClick?.(service)}
      className={cn(
        "flex w-full flex-col gap-3 rounded-xl border border-border bg-card p-4 text-left transition-colors",
        interactive && "hover:border-primary/40 hover:bg-muted/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        !interactive && "cursor-default",
        className
      )}
      data-slot="service-status-card"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-foreground">
            {service.name || SERVICE_LABELS[service.key]}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Checked {formatTimestamp(service.lastCheckAt)}
          </p>
        </div>
        <StatusBadge tone={HEALTH_TONE[service.status]} size="sm" dot>
          {HEALTH_LABELS[service.status]}
        </StatusBadge>
      </div>
      <dl className="grid grid-cols-3 gap-2 text-xs">
        <div>
          <dt className="text-muted-foreground">Uptime</dt>
          <dd className="font-medium text-foreground">{formatPercent(service.uptime, 2)}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Latency</dt>
          <dd className="font-medium text-foreground">{formatMs(service.latencyMs)}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Errors</dt>
          <dd className="font-medium text-foreground">{formatPercent(service.errorRate)}</dd>
        </div>
      </dl>
    </button>
  );
}

export { ServiceStatusCard };
