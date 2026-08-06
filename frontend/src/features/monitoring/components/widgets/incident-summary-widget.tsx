"use client";

import Link from "next/link";

import { StatusBadge } from "@/components/data-display/badges";
import { WidgetCard } from "@/components/dashboard";
import { Button } from "@/components/ui/button";
import { routes } from "@/config/routes";

import { SEVERITY_LABELS } from "../../constants/monitoring.constants";
import { useIncidents } from "../../hooks/use-monitoring";
import { SEVERITY_TONE } from "../shared";

const IncidentSummaryWidget = function IncidentSummaryWidget() {
  const { data, isLoading, isError, refetch } = useIncidents();
  const incidents = data ?? [];
  const open = incidents.filter(
    (i) => i.status !== "resolved" && i.status !== "postmortem"
  );

  return (
    <WidgetCard
      title="Incidents"
      loading={isLoading}
      error={isError ? "Could not load incidents" : undefined}
      onRetry={() => void refetch()}
      empty={incidents.length === 0}
      actions={
        <Button
          render={<Link href={routes.app.monitoringIncidents} />}
          size="sm"
          variant="outline"
        >
          View all
        </Button>
      }
    >
      <div className="flex flex-col gap-3">
        <p className="text-2xl font-semibold tabular-nums text-foreground">
          {open.length} open
        </p>
        <ul className="flex flex-col gap-2">
          {open.slice(0, 3).map((incident) => (
            <li key={incident.id} className="flex items-start justify-between gap-2 text-sm">
              <span className="line-clamp-1 text-foreground">{incident.title}</span>
              <StatusBadge tone={SEVERITY_TONE[incident.severity]} size="sm">
                {SEVERITY_LABELS[incident.severity]}
              </StatusBadge>
            </li>
          ))}
        </ul>
      </div>
    </WidgetCard>
  );
};

export { IncidentSummaryWidget };
