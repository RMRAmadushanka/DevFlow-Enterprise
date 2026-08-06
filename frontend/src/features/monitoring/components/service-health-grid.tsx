"use client";

import type { ServiceHealth } from "../types/monitoring.types";
import { MonitoringEmptyState } from "./monitoring-empty-state";
import { ServiceGridSkeleton } from "./monitoring-skeleton";
import { ServiceStatusCard } from "./service-status-card";

export interface ServiceHealthGridProps {
  services: ServiceHealth[];
  loading?: boolean;
  onServiceClick?: (service: ServiceHealth) => void;
  className?: string;
}

function ServiceHealthGrid({
  services,
  loading,
  onServiceClick,
  className,
}: ServiceHealthGridProps) {
  if (loading) return <ServiceGridSkeleton />;

  if (services.length === 0) {
    return <MonitoringEmptyState variant="no-data" />;
  }

  return (
    <div
      className={className ?? "grid gap-3 sm:grid-cols-2 xl:grid-cols-4"}
      data-slot="service-health-grid"
    >
      {services.map((service) => (
        <ServiceStatusCard
          key={service.key}
          service={service}
          onClick={onServiceClick}
        />
      ))}
    </div>
  );
}

export { ServiceHealthGrid };
