"use client";

import * as React from "react";

import { SystemHealthWidget } from "./widgets/system-health-widget";
import { ServiceStatusWidget } from "./widgets/service-status-widget";
import { AlertSummaryWidget } from "./widgets/alert-summary-widget";
import { IncidentSummaryWidget } from "./widgets/incident-summary-widget";
import { ErrorTrendsWidget } from "./widgets/error-trends-widget";
import { DeploymentMetricsWidget } from "./widgets/deployment-metrics-widget";
import { SprintVelocityWidget } from "./widgets/sprint-velocity-widget";
import { ProjectHealthWidget } from "./widgets/project-health-widget";
import { RepositoryActivityWidget } from "./widgets/repository-activity-widget";
import { useMonitoringStore } from "../store/monitoring.store";
import type { DashboardWidgetId } from "../types/monitoring.types";

const WIDGET_MAP: Record<DashboardWidgetId, React.ComponentType> = {
  system_health: SystemHealthWidget,
  service_status: ServiceStatusWidget,
  alert_summary: AlertSummaryWidget,
  incident_summary: IncidentSummaryWidget,
  error_trends: ErrorTrendsWidget,
  deployment_metrics: DeploymentMetricsWidget,
  sprint_velocity: SprintVelocityWidget,
  project_health: ProjectHealthWidget,
  repository_activity: RepositoryActivityWidget,
};

export interface CustomDashboardProps {
  className?: string;
}

function CustomDashboard({ className }: CustomDashboardProps) {
  const widgets = useMonitoringStore((s) => s.dashboardWidgets);

  return (
    <div
      className={className ?? "grid gap-4 md:grid-cols-2 xl:grid-cols-3"}
      data-slot="custom-dashboard"
    >
      {widgets.map((id) => {
        const Widget = WIDGET_MAP[id];
        return Widget ? <Widget key={id} /> : null;
      })}
    </div>
  );
}

export { CustomDashboard };
