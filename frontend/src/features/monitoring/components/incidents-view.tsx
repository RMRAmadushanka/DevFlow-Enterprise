"use client";

import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";

import { StatusBadge } from "@/components/data-display/badges";
import { DataTable } from "@/components/data-display/table";
import { ListPageTemplate } from "@/components/layout/page-templates";
import { Button } from "@/components/ui/button";
import { PermissionGuard } from "@/lib/permissions";
import { routes } from "@/config/routes";

import { SEVERITY_LABELS } from "../constants/monitoring.constants";
import { useIncidents } from "../hooks/use-monitoring";
import { useMonitoringStore } from "../store/monitoring.store";
import type { Incident } from "../types/monitoring.types";
import { formatTimestamp } from "../utils/format";
import { INCIDENT_STATUS_TONE, SEVERITY_TONE } from "./shared";
import { AlertFilters } from "./alert-filters";
import { IncidentBanner } from "./incident-banner";
import { IncidentDetailsDrawer } from "./incident-details-drawer";
import { MonitoringEmptyState } from "./monitoring-empty-state";
import { TableSkeleton } from "./monitoring-skeleton";

export interface IncidentsViewProps {
  title?: string;
  description?: string;
}

function IncidentsView({
  title = "Incidents",
  description = "Track open incidents and response timelines.",
}: IncidentsViewProps) {
  const { data, isLoading, isError, refetch } = useIncidents();
  const filters = useMonitoringStore((s) => s.filters);
  const selectedIncidentId = useMonitoringStore((s) => s.selectedIncidentId);
  const setSelectedIncidentId = useMonitoringStore((s) => s.setSelectedIncidentId);

  const incidents = data ?? [];
  const hasQuery =
    Boolean(filters.q.trim()) ||
    filters.severity !== "all" ||
    filters.status !== "all" ||
    filters.service !== "all";

  const columns = React.useMemo<ColumnDef<Incident>[]>(
    () => [
      {
        accessorKey: "number",
        header: "ID",
        cell: ({ row }) => (
          <span className="font-mono text-sm text-foreground">{row.original.number}</span>
        ),
      },
      {
        accessorKey: "title",
        header: "Title",
        cell: ({ row }) => (
          <div>
            <p className="font-medium text-foreground">{row.original.title}</p>
            <p className="text-xs text-muted-foreground">{row.original.ownerName}</p>
          </div>
        ),
      },
      {
        accessorKey: "severity",
        header: "Severity",
        cell: ({ row }) => (
          <StatusBadge tone={SEVERITY_TONE[row.original.severity]} size="sm" dot>
            {SEVERITY_LABELS[row.original.severity]}
          </StatusBadge>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <StatusBadge tone={INCIDENT_STATUS_TONE[row.original.status]} size="sm">
            {row.original.status}
          </StatusBadge>
        ),
      },
      {
        accessorKey: "createdAt",
        header: "Opened",
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {formatTimestamp(row.original.createdAt)}
          </span>
        ),
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => setSelectedIncidentId(row.original.id)}
          >
            Details
          </Button>
        ),
      },
    ],
    [setSelectedIncidentId]
  );

  return (
    <PermissionGuard
      permission="monitoring.read"
      fallback={<MonitoringEmptyState variant="no-permission" />}
    >
      <ListPageTemplate
        title={title}
        description={description}
        breadcrumbs={[
          { label: "Workspace", href: routes.app.home },
          { label: "Monitoring", href: routes.app.monitoring },
          { label: "Incidents", href: routes.app.monitoringIncidents },
        ]}
        filters={<AlertFilters />}
      >
        <div className="flex flex-col gap-4">
          {!isLoading && incidents.length > 0 ? (
            <IncidentBanner
              incidents={incidents}
              onSelect={(incident) => setSelectedIncidentId(incident.id)}
            />
          ) : null}

          {isLoading ? <TableSkeleton /> : null}
          {isError ? (
            <MonitoringEmptyState
              variant="no-data"
              action={
                <button
                  type="button"
                  className="text-sm font-medium text-primary underline"
                  onClick={() => void refetch()}
                >
                  Retry
                </button>
              }
            />
          ) : null}
          {!isLoading && !isError && incidents.length === 0 ? (
            <MonitoringEmptyState variant={hasQuery ? "no-results" : "no-incidents"} />
          ) : null}
          {!isLoading && !isError && incidents.length > 0 ? (
            <DataTable columns={columns} data={incidents} aria-label="Incidents" />
          ) : null}
        </div>
      </ListPageTemplate>

      <IncidentDetailsDrawer
        incidentId={selectedIncidentId}
        open={Boolean(selectedIncidentId)}
        onOpenChange={(open) => {
          if (!open) setSelectedIncidentId(null);
        }}
      />
    </PermissionGuard>
  );
}

export { IncidentsView };
