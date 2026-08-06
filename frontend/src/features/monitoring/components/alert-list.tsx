"use client";

import type { Alert } from "../types/monitoring.types";
import { AlertCard } from "./alert-card";
import { MonitoringEmptyState, type MonitoringEmptyVariant } from "./monitoring-empty-state";
import { AlertCardSkeleton } from "./monitoring-skeleton";

export interface AlertListProps {
  alerts: Alert[];
  loading?: boolean;
  emptyVariant?: MonitoringEmptyVariant;
  onEdit?: (alert: Alert) => void;
  onDelete?: (alert: Alert) => void;
  onSelect?: (alert: Alert) => void;
  onCreate?: () => void;
  className?: string;
}

function AlertList({
  alerts,
  loading,
  emptyVariant = "no-alerts",
  onEdit,
  onDelete,
  onSelect,
  onCreate,
  className,
}: AlertListProps) {
  if (loading) {
    return (
      <div className={className ?? "grid gap-3 md:grid-cols-2"}>
        {Array.from({ length: 4 }).map((_, i) => (
          <AlertCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (alerts.length === 0) {
    return <MonitoringEmptyState variant={emptyVariant} onCreateAlert={onCreate} />;
  }

  return (
    <div className={className ?? "grid gap-3 md:grid-cols-2"} data-slot="alert-list">
      {alerts.map((alert) => (
        <AlertCard
          key={alert.id}
          alert={alert}
          onEdit={onEdit}
          onDelete={onDelete}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}

export { AlertList };
