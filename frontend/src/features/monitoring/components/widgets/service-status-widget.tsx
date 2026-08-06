"use client";

import Link from "next/link";

import { StatusBadge } from "@/components/data-display/badges";
import { WidgetCard } from "@/components/dashboard";
import { Button } from "@/components/ui/button";
import { routes } from "@/config/routes";

import { HEALTH_LABELS } from "../../constants/monitoring.constants";
import { useServices } from "../../hooks/use-monitoring";
import { HEALTH_TONE } from "../shared";

const ServiceStatusWidget = function ServiceStatusWidget() {
  const { data, isLoading, isError, refetch } = useServices();
  const services = data ?? [];

  return (
    <WidgetCard
      title="Service status"
      loading={isLoading}
      error={isError ? "Could not load services" : undefined}
      onRetry={() => void refetch()}
      empty={services.length === 0}
      actions={
        <Button
          render={<Link href={routes.app.monitoringServices} />}
          size="sm"
          variant="outline"
        >
          View all
        </Button>
      }
    >
      <ul className="flex flex-col gap-2">
        {services.slice(0, 5).map((service) => (
          <li key={service.key} className="flex items-center justify-between gap-2 text-sm">
            <span className="truncate text-foreground">{service.name}</span>
            <StatusBadge tone={HEALTH_TONE[service.status]} size="sm" dot>
              {HEALTH_LABELS[service.status]}
            </StatusBadge>
          </li>
        ))}
      </ul>
    </WidgetCard>
  );
};

export { ServiceStatusWidget };
