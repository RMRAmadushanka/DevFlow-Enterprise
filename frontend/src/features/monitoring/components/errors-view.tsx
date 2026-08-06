"use client";

import { ListPageTemplate } from "@/components/layout/page-templates";
import { PermissionGuard } from "@/lib/permissions";
import { routes } from "@/config/routes";

import { useErrors } from "../hooks/use-monitoring";
import { useMonitoringStore } from "../store/monitoring.store";
import { AlertFilters } from "./alert-filters";
import { ErrorDetailsDrawer } from "./error-details-drawer";
import { ErrorTrackingTable } from "./error-tracking-table";
import { MonitoringEmptyState } from "./monitoring-empty-state";

export interface ErrorsViewProps {
  title?: string;
  description?: string;
}

function ErrorsView({
  title = "Error tracking",
  description = "Inspect application errors, stacks, and regressions.",
}: ErrorsViewProps) {
  const { data, isLoading, isError, refetch } = useErrors();
  const filters = useMonitoringStore((s) => s.filters);
  const selectedErrorId = useMonitoringStore((s) => s.selectedErrorId);
  const setSelectedErrorId = useMonitoringStore((s) => s.setSelectedErrorId);

  const hasQuery =
    Boolean(filters.q.trim()) ||
    filters.service !== "all" ||
    filters.environment !== "all" ||
    filters.status !== "all";

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
          { label: "Errors", href: routes.app.monitoringErrors },
        ]}
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
          <ErrorTrackingTable
            errors={data ?? []}
            loading={isLoading}
            emptyVariant={hasQuery ? "no-results" : "no-errors"}
            onSelect={(error) => setSelectedErrorId(error.id)}
          />
        )}
      </ListPageTemplate>

      <ErrorDetailsDrawer
        errorId={selectedErrorId}
        open={Boolean(selectedErrorId)}
        onOpenChange={(open) => {
          if (!open) setSelectedErrorId(null);
        }}
      />
    </PermissionGuard>
  );
}

export { ErrorsView };
