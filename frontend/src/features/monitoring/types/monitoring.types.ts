export type HealthStatus = "healthy" | "degraded" | "critical" | "unknown";

export type ServiceKey =
  | "authentication"
  | "projects"
  | "tasks"
  | "repositories"
  | "deployments"
  | "documents"
  | "notifications"
  | "analytics";

export type AlertSeverity = "critical" | "high" | "medium" | "low";

export type AlertStatus = "active" | "triggered" | "acknowledged" | "resolved" | "disabled";

export type IncidentStatus = "open" | "investigating" | "mitigating" | "resolved" | "postmortem";

export type ErrorStatus = "open" | "resolved" | "ignored" | "regressing";

export type Environment = "production" | "staging" | "development";

export type MetricKey =
  | "cpu"
  | "memory"
  | "disk"
  | "network"
  | "request_rate"
  | "response_time"
  | "error_rate"
  | "availability";

export type AlertCondition = "gt" | "gte" | "lt" | "lte" | "eq";

export type ReportFormat = "pdf" | "csv";

export type DashboardWidgetId =
  | "system_health"
  | "service_status"
  | "alert_summary"
  | "incident_summary"
  | "error_trends"
  | "deployment_metrics"
  | "sprint_velocity"
  | "project_health"
  | "repository_activity";

export interface MonitoringFilters {
  q: string;
  dateFrom: string | null;
  dateTo: string | null;
  environment: Environment | "all";
  service: ServiceKey | "all";
  severity: AlertSeverity | "all";
  status: string | "all";
  userId: string | null;
  projectId: string | null;
}

export interface MetricPoint {
  label: string;
  value: number;
  secondary?: number;
}

export interface MetricSeries {
  key: MetricKey;
  name: string;
  unit: string;
  current: number;
  previous: number;
  trend: number;
  points: MetricPoint[];
}

export interface SystemHealth {
  overall: HealthStatus;
  availability: number;
  cpu: number;
  memory: number;
  disk: number;
  networkMbps: number;
  databaseStatus: HealthStatus;
  apiStatus: HealthStatus;
  lastUpdated: string;
}

export interface ServiceHealth {
  key: ServiceKey;
  name: string;
  status: HealthStatus;
  uptime: number;
  latencyMs: number;
  lastCheckAt: string;
  errorRate: number;
}

export interface Alert {
  id: string;
  name: string;
  description: string;
  severity: AlertSeverity;
  status: AlertStatus;
  service: ServiceKey;
  metric: MetricKey;
  threshold: number;
  condition: AlertCondition;
  notificationChannel: string;
  createdAt: string;
  lastTriggeredAt?: string;
  triggeredCount: number;
}

export interface IncidentEvent {
  id: string;
  timestamp: string;
  actorName: string;
  summary: string;
  type: "detected" | "update" | "mitigation" | "resolved" | "note";
}

export interface Incident {
  id: string;
  number: string;
  title: string;
  severity: AlertSeverity;
  status: IncidentStatus;
  affectedServices: ServiceKey[];
  ownerName: string;
  ownerId: string;
  createdAt: string;
  resolvedAt?: string;
  relatedAlertIds: string[];
  timeline: IncidentEvent[];
  postmortemSummary?: string;
}

export interface TrackedError {
  id: string;
  message: string;
  service: ServiceKey;
  count: number;
  firstSeenAt: string;
  lastSeenAt: string;
  environment: Environment;
  status: ErrorStatus;
  stackTrace: string;
  metadata: Record<string, string>;
  browser?: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: string;
  resource: string;
  resourceType: string;
  ipAddress: string;
  status: "success" | "failure";
  environment: Environment;
}

export interface UserActivityRow {
  id: string;
  userId: string;
  userName: string;
  logins: number;
  projectActions: number;
  taskActions: number;
  deploymentActions: number;
  documentActions: number;
  lastActiveAt: string;
}

export interface AnalyticsOverview {
  engineeringVelocity: number;
  deploymentSuccessRate: number;
  openIncidents: number;
  projectSuccessRate: number;
  teamUtilization: number;
  platformHealth: HealthStatus;
  sprintCompletion: number;
  repoActivity: number;
  errorTrend: MetricPoint[];
  deploymentTrend: MetricPoint[];
  velocityTrend: MetricPoint[];
}

export interface ReportDefinition {
  id: string;
  name: string;
  description: string;
  category: "engineering" | "executive" | "operations" | "security";
  metrics: string[];
  schedule?: string;
  lastExportedAt?: string;
  createdAt: string;
  createdBy: string;
}

export interface MonitoringOverview {
  system: SystemHealth;
  services: ServiceHealth[];
  metrics: MetricSeries[];
  alerts: Alert[];
  incidents: Incident[];
  errors: TrackedError[];
  alertSummary: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    active: number;
  };
}

export interface CreateAlertPayload {
  name: string;
  description?: string;
  severity: AlertSeverity;
  service: ServiceKey;
  metric: MetricKey;
  threshold: number;
  condition: AlertCondition;
  notificationChannel?: string;
}

export interface UpdateAlertPayload extends Partial<CreateAlertPayload> {
  status?: AlertStatus;
}

export interface CreateReportPayload {
  name: string;
  description?: string;
  category: ReportDefinition["category"];
  metrics: string[];
  schedule?: string;
}

export interface CustomDashboardLayout {
  widgets: DashboardWidgetId[];
}
