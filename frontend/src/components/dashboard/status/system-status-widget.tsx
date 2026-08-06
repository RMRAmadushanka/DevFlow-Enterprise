"use client";

import * as React from "react";

import { StatusIndicator } from "@/components/data-display/status";
import type { Tone } from "@/components/dashboard/shared/types";
import type { SystemStatus } from "@/components/dashboard/shared/types";
import { WidgetCard } from "@/components/dashboard/widgets";
import { DashboardEmptyState } from "@/components/dashboard/widgets";
import type { SystemStatusWidgetProps } from "./types";

const statusTone: Record<SystemStatus, Tone> = {
  healthy: "success",
  warning: "warning",
  critical: "danger",
  offline: "neutral",
};

const statusLabel: Record<SystemStatus, string> = {
  healthy: "Healthy",
  warning: "Warning",
  critical: "Critical",
  offline: "Offline",
};

/**
 * Service / infrastructure status list with color-independent text labels.
 */
function SystemStatusWidget({
  title = "System status",
  items,
  actions,
  loading,
  empty,
  error,
  onRetry,
  className,
}: SystemStatusWidgetProps) {
  const isEmpty = empty ?? items.length === 0;

  return (
    <WidgetCard
      title={title}
      actions={actions}
      loading={loading}
      empty={!loading && !error && isEmpty}
      error={error}
      onRetry={onRetry}
      emptyState={<DashboardEmptyState title="No services" description="Status will appear when services are registered." />}
      className={className}
      contentClassName="p-0"
    >
      <ul className="divide-y divide-border" aria-label="System status">
        {items.map((item) => (
          <li
            key={item.id}
            className="flex items-start justify-between gap-3 px-(--card-spacing) py-3"
          >
            <div className="flex min-w-0 flex-col gap-0.5">
              <span className="text-sm font-medium text-foreground">{item.name}</span>
              {item.description ? (
                <span className="text-xs text-muted-foreground">{item.description}</span>
              ) : null}
            </div>
            <div className="flex shrink-0 flex-col items-end gap-1">
              <StatusIndicator
                tone={statusTone[item.status]}
                label={statusLabel[item.status]}
                pulse={item.status === "healthy"}
                size="sm"
              />
              {item.meta ? <span className="text-xs text-muted-foreground">{item.meta}</span> : null}
            </div>
          </li>
        ))}
      </ul>
    </WidgetCard>
  );
}

export { SystemStatusWidget };
