"use client";

import * as React from "react";
import { Plus } from "lucide-react";

import { ListPageTemplate } from "@/components/layout/page-templates";
import { Button } from "@/components/ui/button";
import { PermissionGuard } from "@/lib/permissions";
import { routes } from "@/config/routes";

import { useAlerts } from "../hooks/use-monitoring";
import { useMonitoringStore } from "../store/monitoring.store";
import type { Alert } from "../types/monitoring.types";
import { AlertFilters } from "./alert-filters";
import { AlertList } from "./alert-list";
import { CreateAlertModal } from "./create-alert-modal";
import { DeleteAlertModal } from "./delete-alert-modal";
import { EditAlertModal } from "./edit-alert-modal";
import { MonitoringEmptyState } from "./monitoring-empty-state";

export interface AlertsViewProps {
  title?: string;
  description?: string;
}

function AlertsView({
  title = "Alerts",
  description = "Configure and track alert rules across services.",
}: AlertsViewProps) {
  const { data, isLoading, isError, refetch } = useAlerts();
  const filters = useMonitoringStore((s) => s.filters);
  const [createOpen, setCreateOpen] = React.useState(false);
  const [editTarget, setEditTarget] = React.useState<Alert | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<Alert | null>(null);

  const hasQuery =
    Boolean(filters.q.trim()) ||
    filters.severity !== "all" ||
    filters.service !== "all" ||
    filters.status !== "all" ||
    filters.environment !== "all";

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
          { label: "Alerts", href: routes.app.monitoringAlerts },
        ]}
        actions={
          <PermissionGuard permission="monitoring.manage">
            <Button type="button" size="sm" onClick={() => setCreateOpen(true)}>
              <Plus className="size-4" />
              Create alert
            </Button>
          </PermissionGuard>
        }
        filters={<AlertFilters />}
      >
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
        ) : (
          <AlertList
            alerts={data ?? []}
            loading={isLoading}
            emptyVariant={hasQuery ? "no-results" : "no-alerts"}
            onCreate={() => setCreateOpen(true)}
            onEdit={setEditTarget}
            onDelete={setDeleteTarget}
            onSelect={setEditTarget}
          />
        )}
      </ListPageTemplate>

      <CreateAlertModal open={createOpen} onOpenChange={setCreateOpen} />
      <EditAlertModal
        alert={editTarget}
        open={Boolean(editTarget)}
        onOpenChange={(open) => {
          if (!open) setEditTarget(null);
        }}
      />
      <DeleteAlertModal
        alert={deleteTarget}
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      />
    </PermissionGuard>
  );
}

export { AlertsView };
