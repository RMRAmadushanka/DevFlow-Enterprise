import { createQueryKeys } from "@/lib/api/query-keys";

import type {
  AlertSeverity,
  DashboardWidgetId,
  Environment,
  HealthStatus,
  MetricKey,
  MonitoringFilters,
  ServiceKey,
} from "../types/monitoring.types";

export const MONITORING_STORAGE_KEY = "devflow.monitoring.ui";

export const monitoringKeys = {
  ...createQueryKeys("monitoring"),
  overview: (filters: MonitoringFilters) =>
    [...createQueryKeys("monitoring").all, "overview", filters] as const,
  metrics: (filters: MonitoringFilters) =>
    [...createQueryKeys("monitoring").all, "metrics", filters] as const,
  alerts: (filters: MonitoringFilters) =>
    [...createQueryKeys("monitoring").all, "alerts", filters] as const,
  incidents: (filters: MonitoringFilters) =>
    [...createQueryKeys("monitoring").all, "incidents", filters] as const,
  errors: (filters: MonitoringFilters) =>
    [...createQueryKeys("monitoring").all, "errors", filters] as const,
  audit: (filters: MonitoringFilters) =>
    [...createQueryKeys("monitoring").all, "audit", filters] as const,
  analytics: (filters: MonitoringFilters) =>
    [...createQueryKeys("monitoring").all, "analytics", filters] as const,
  reports: () => [...createQueryKeys("monitoring").all, "reports"] as const,
  activity: () => [...createQueryKeys("monitoring").all, "activity"] as const,
  layout: () => [...createQueryKeys("monitoring").all, "layout"] as const,
};

export const DEFAULT_MONITORING_FILTERS: MonitoringFilters = {
  q: "",
  dateFrom: null,
  dateTo: null,
  environment: "all",
  service: "all",
  severity: "all",
  status: "all",
  userId: null,
  projectId: null,
};

export const HEALTH_LABELS: Record<HealthStatus, string> = {
  healthy: "Healthy",
  degraded: "Degraded",
  critical: "Critical",
  unknown: "Unknown",
};

export const SEVERITY_LABELS: Record<AlertSeverity, string> = {
  critical: "Critical",
  high: "High",
  medium: "Medium",
  low: "Low",
};

export const SERVICE_LABELS: Record<ServiceKey, string> = {
  authentication: "Authentication",
  projects: "Projects",
  tasks: "Tasks",
  repositories: "Repositories",
  deployments: "Deployments",
  documents: "Documents",
  notifications: "Notifications",
  analytics: "Analytics",
};

export const METRIC_LABELS: Record<MetricKey, string> = {
  cpu: "CPU Usage",
  memory: "Memory Usage",
  disk: "Disk Usage",
  network: "Network Traffic",
  request_rate: "Request Rate",
  response_time: "Response Time",
  error_rate: "Error Rate",
  availability: "Availability",
};

export const ENVIRONMENT_OPTIONS: Array<{ value: Environment | "all"; label: string }> = [
  { value: "all", label: "All environments" },
  { value: "production", label: "Production" },
  { value: "staging", label: "Staging" },
  { value: "development", label: "Development" },
];

export const SERVICE_OPTIONS: Array<{ value: ServiceKey | "all"; label: string }> = [
  { value: "all", label: "All services" },
  ...Object.entries(SERVICE_LABELS).map(([value, label]) => ({
    value: value as ServiceKey,
    label,
  })),
];

export const SEVERITY_OPTIONS: Array<{ value: AlertSeverity | "all"; label: string }> = [
  { value: "all", label: "All severities" },
  { value: "critical", label: "Critical" },
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
];

export const METRIC_OPTIONS: Array<{ value: MetricKey; label: string }> = Object.entries(
  METRIC_LABELS
).map(([value, label]) => ({ value: value as MetricKey, label }));

export const CONDITION_OPTIONS = [
  { value: "gt", label: "Greater than" },
  { value: "gte", label: "Greater than or equal" },
  { value: "lt", label: "Less than" },
  { value: "lte", label: "Less than or equal" },
  { value: "eq", label: "Equal" },
];

export const CHANNEL_OPTIONS = [
  { value: "email", label: "Email" },
  { value: "slack", label: "Slack" },
  { value: "pagerduty", label: "PagerDuty" },
  { value: "webhook", label: "Webhook" },
];

export const DEFAULT_DASHBOARD_WIDGETS: DashboardWidgetId[] = [
  "system_health",
  "service_status",
  "alert_summary",
  "incident_summary",
  "error_trends",
  "deployment_metrics",
  "sprint_velocity",
  "project_health",
  "repository_activity",
];

export const WIDGET_LABELS: Record<DashboardWidgetId, string> = {
  system_health: "System Health",
  service_status: "Service Status",
  alert_summary: "Alert Summary",
  incident_summary: "Incident Summary",
  error_trends: "Error Trends",
  deployment_metrics: "Deployment Metrics",
  sprint_velocity: "Sprint Velocity",
  project_health: "Project Health",
  repository_activity: "Repository Activity",
};

export const REPORT_METRIC_OPTIONS = [
  { value: "velocity", label: "Engineering velocity" },
  { value: "deployments", label: "Deployment success" },
  { value: "incidents", label: "Open incidents" },
  { value: "availability", label: "Availability" },
  { value: "errors", label: "Error rate" },
  { value: "utilization", label: "Team utilization" },
];
