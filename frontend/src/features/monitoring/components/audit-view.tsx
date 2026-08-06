"use client";

import { ListPageTemplate } from "@/components/layout/page-templates";
import { PermissionGuard } from "@/lib/permissions";
import { routes } from "@/config/routes";

import { useAuditLogs, useUserActivity } from "../hooks/use-monitoring";
import { useMonitoringStore } from "../store/monitoring.store";
import { AuditLogFilters } from "./audit-log-filters";
import { AuditLogTable } from "./audit-log-table";
import { AuditTimeline } from "./audit-timeline";
import { MonitoringEmptyState } from "./monitoring-empty-state";
import { TeamActivityChart } from "./team-activity-chart";
import { UserActivityTable } from "./user-activity-table";

export interface AuditViewProps {
  title?: string;
  description?: string;
}

function AuditView({
  title = "Audit log",
  description = "Security and compliance activity across the workspace.",
}: AuditViewProps) {
  const { data, isLoading, isError, refetch } = useAuditLogs();
  const { data: activity, isLoading: activityLoading } = useUserActivity();
  const filters = useMonitoringStore((s) => s.filters);

  const hasQuery =
    Boolean(filters.q.trim()) ||
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
          { label: "Audit", href: routes.app.monitoringAudit },
        ]}
        filters={<AuditLogFilters />}
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
          <div className="flex flex-col gap-8">
            <AuditLogTable
              entries={data ?? []}
              loading={isLoading}
              emptyVariant={hasQuery ? "no-results" : "no-audit"}
            />
            <div className="grid gap-6 lg:grid-cols-2">
              <div>
                <h2 className="mb-3 text-sm font-semibold text-foreground">
                  Recent activity
                </h2>
                <AuditTimeline entries={(data ?? []).slice(0, 8)} loading={isLoading} />
              </div>
              <TeamActivityChart />
            </div>
            <div>
              <h2 className="mb-3 text-sm font-semibold text-foreground">
                User activity
              </h2>
              <UserActivityTable rows={activity ?? []} loading={activityLoading} />
            </div>
          </div>
        )}
      </ListPageTemplate>
    </PermissionGuard>
  );
}

export { AuditView };
