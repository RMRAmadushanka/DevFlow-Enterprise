"use client";

import Link from "next/link";
import { Plus, RefreshCw, Settings2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PermissionGuard } from "@/lib/permissions";
import { routes } from "@/config/routes";

export interface MonitoringHeaderProps {
  mode?: "monitoring" | "analytics";
  title?: string;
  description?: string;
  /** When false, only action buttons are rendered (use with ListPageTemplate). */
  showTitle?: boolean;
  onRefresh?: () => void;
  onCreateAlert?: () => void;
  onCustomize?: () => void;
  refreshing?: boolean;
}

function MonitoringHeader({
  mode = "monitoring",
  title,
  description,
  showTitle = true,
  onRefresh,
  onCreateAlert,
  onCustomize,
  refreshing,
}: MonitoringHeaderProps) {
  const resolvedTitle =
    title ?? (mode === "analytics" ? "Analytics" : "Monitoring");
  const resolvedDescription =
    description ??
    (mode === "analytics"
      ? "Engineering and executive delivery insights."
      : "Platform health, alerts, incidents, and error tracking.");

  const actions = (
      <div className="flex flex-wrap items-center gap-2">
        {onRefresh ? (
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={onRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`size-4 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        ) : null}
        {onCustomize ? (
          <Button type="button" size="sm" variant="outline" onClick={onCustomize}>
            <Settings2 className="size-4" />
            Customize
          </Button>
        ) : null}
        {mode === "monitoring" ? (
          <PermissionGuard permission="monitoring.manage">
            {onCreateAlert ? (
              <Button type="button" size="sm" onClick={onCreateAlert}>
                <Plus className="size-4" />
                Create alert
              </Button>
            ) : (
              <Button
                render={<Link href={routes.app.monitoringAlerts} />}
                size="sm"
              >
                <Plus className="size-4" />
                Alerts
              </Button>
            )}
          </PermissionGuard>
        ) : (
          <PermissionGuard permission="analytics.export">
            <Button
              render={<Link href={routes.app.analyticsReports} />}
              size="sm"
              variant="outline"
            >
              Reports
            </Button>
          </PermissionGuard>
        )}
      </div>
  );

  if (!showTitle) {
    return (
      <div data-slot="monitoring-header" className="flex justify-end">
        {actions}
      </div>
    );
  }

  return (
    <div
      className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"
      data-slot="monitoring-header"
    >
      <div className="min-w-0">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          {resolvedTitle}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">{resolvedDescription}</p>
      </div>
      {actions}
    </div>
  );
}

export { MonitoringHeader };
