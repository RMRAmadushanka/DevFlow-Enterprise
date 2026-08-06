"use client";

import Link from "next/link";

import { FeatureEmptyState } from "@/components/architecture/empty";
import { Button } from "@/components/ui/button";
import { PermissionGuard } from "@/lib/permissions";
import { routes } from "@/config/routes";

export type MonitoringEmptyVariant =
  | "no-data"
  | "no-results"
  | "no-permission"
  | "first-time"
  | "no-alerts"
  | "no-incidents"
  | "no-errors"
  | "no-audit"
  | "no-reports";

const COPY: Record<
  MonitoringEmptyVariant,
  {
    title: string;
    description: string;
    featureVariant: "no-data" | "no-results" | "first-time" | "no-permission";
    showCreateAlert?: boolean;
    showCreateReport?: boolean;
  }
> = {
  "no-data": {
    title: "No monitoring data",
    description: "Metrics and health signals will appear once services start reporting.",
    featureVariant: "no-data",
  },
  "no-results": {
    title: "No matching results",
    description: "Try adjusting search or filters to find what you need.",
    featureVariant: "no-results",
  },
  "no-permission": {
    title: "Permission required",
    description: "You do not have access to monitoring or analytics for this workspace.",
    featureVariant: "no-permission",
  },
  "first-time": {
    title: "Welcome to Monitoring",
    description: "Connect services and configure alerts to start observing your platform.",
    featureVariant: "first-time",
    showCreateAlert: true,
  },
  "no-alerts": {
    title: "No alert rules",
    description: "Create an alert rule to get notified when thresholds are breached.",
    featureVariant: "first-time",
    showCreateAlert: true,
  },
  "no-incidents": {
    title: "No incidents",
    description: "Open incidents will appear here when alerts escalate.",
    featureVariant: "no-data",
  },
  "no-errors": {
    title: "No tracked errors",
    description: "Application errors will show up once error tracking receives events.",
    featureVariant: "no-data",
  },
  "no-audit": {
    title: "No audit entries",
    description: "User and system actions will appear in the audit log as they occur.",
    featureVariant: "no-data",
  },
  "no-reports": {
    title: "No reports yet",
    description: "Build a report to export engineering or executive metrics.",
    featureVariant: "first-time",
    showCreateReport: true,
  },
};

export interface MonitoringEmptyStateProps {
  variant?: MonitoringEmptyVariant;
  action?: React.ReactNode;
  onCreateAlert?: () => void;
  onCreateReport?: () => void;
}

function MonitoringEmptyState({
  variant = "no-data",
  action,
  onCreateAlert,
  onCreateReport,
}: MonitoringEmptyStateProps) {
  const copy = COPY[variant];

  const defaultAction =
    action ??
    (copy.showCreateAlert ? (
      <PermissionGuard permission="monitoring.manage">
        {onCreateAlert ? (
          <Button type="button" onClick={onCreateAlert}>
            Create alert
          </Button>
        ) : (
          <Button render={<Link href={routes.app.monitoringAlerts} />}>View alerts</Button>
        )}
      </PermissionGuard>
    ) : copy.showCreateReport ? (
      <PermissionGuard permission="analytics.export">
        {onCreateReport ? (
          <Button type="button" onClick={onCreateReport}>
            Create report
          </Button>
        ) : (
          <Button render={<Link href={routes.app.analyticsReports} />}>View reports</Button>
        )}
      </PermissionGuard>
    ) : undefined);

  return (
    <FeatureEmptyState
      variant={copy.featureVariant}
      title={copy.title}
      description={copy.description}
      action={defaultAction}
    />
  );
}

export { MonitoringEmptyState };
