import type {
  Alert,
  AnalyticsOverview,
  AuditLogEntry,
  Incident,
  MetricSeries,
  MonitoringOverview,
  ReportDefinition,
  SystemHealth,
} from "../../types/monitoring.types";

export const sampleSystem: SystemHealth = {
  overall: "degraded",
  availability: 99.72,
  cpu: 64,
  memory: 71,
  disk: 58,
  networkMbps: 420,
  databaseStatus: "healthy",
  apiStatus: "degraded",
  lastUpdated: "2026-08-06T16:00:00.000Z",
};

export const sampleMetric: MetricSeries = {
  key: "cpu",
  name: "CPU Usage",
  unit: "%",
  current: 64,
  previous: 58,
  trend: 10.3,
  points: [
    { label: "00:00", value: 52 },
    { label: "08:00", value: 60 },
    { label: "Now", value: 64 },
  ],
};

export const sampleAlert: Alert = {
  id: "alert_1",
  name: "API latency p95 elevated",
  description: "Response time exceeds 300ms for 5 minutes.",
  severity: "high",
  status: "triggered",
  service: "deployments",
  metric: "response_time",
  threshold: 300,
  condition: "gte",
  notificationChannel: "pagerduty",
  createdAt: "2026-07-20T10:00:00.000Z",
  lastTriggeredAt: "2026-08-06T15:45:00.000Z",
  triggeredCount: 14,
};

export const sampleIncident: Incident = {
  id: "inc_1",
  number: "INC-214",
  title: "Elevated deployment API latency",
  severity: "high",
  status: "investigating",
  affectedServices: ["deployments"],
  ownerName: "Leo Martins",
  ownerId: "user_leo",
  createdAt: "2026-08-06T14:30:00.000Z",
  relatedAlertIds: ["alert_1"],
  timeline: [
    {
      id: "ie_1",
      timestamp: "2026-08-06T14:30:00.000Z",
      actorName: "Monitor Bot",
      summary: "Incident opened from alert",
      type: "detected",
    },
    {
      id: "ie_2",
      timestamp: "2026-08-06T14:45:00.000Z",
      actorName: "Leo Martins",
      summary: "Investigating upstream timeout",
      type: "update",
    },
  ],
};

export const sampleAudit: AuditLogEntry = {
  id: "aud_1",
  timestamp: "2026-08-06T15:50:00.000Z",
  userId: "user_ava",
  userName: "Ava Chen",
  action: "repository.settings.update",
  resource: "acme/api-gateway",
  resourceType: "repository",
  ipAddress: "203.0.113.10",
  status: "success",
  environment: "production",
};

export const sampleAnalytics: AnalyticsOverview = {
  engineeringVelocity: 38,
  deploymentSuccessRate: 96.4,
  openIncidents: 2,
  projectSuccessRate: 88,
  teamUtilization: 74,
  platformHealth: "degraded",
  sprintCompletion: 81,
  repoActivity: 126,
  errorTrend: [{ label: "Now", value: 36 }],
  deploymentTrend: [{ label: "Now", value: 12 }],
  velocityTrend: [{ label: "Now", value: 34 }],
};

export const sampleReport: ReportDefinition = {
  id: "rep_1",
  name: "Weekly engineering digest",
  description: "Velocity, deployments, and incident summary.",
  category: "engineering",
  metrics: ["velocity", "deployments"],
  createdAt: "2026-06-01T10:00:00.000Z",
  createdBy: "Ava Chen",
};

export const sampleOverview: MonitoringOverview = {
  system: sampleSystem,
  services: [
    {
      key: "deployments",
      name: "Deployments",
      status: "critical",
      uptime: 99.1,
      latencyMs: 240,
      lastCheckAt: "2026-08-06T15:58:00.000Z",
      errorRate: 4.2,
    },
  ],
  metrics: [
    sampleMetric,
    {
      ...sampleMetric,
      key: "memory",
      name: "Memory Usage",
      current: 71,
    },
    {
      ...sampleMetric,
      key: "response_time",
      name: "Response Time",
      unit: "ms",
      current: 248,
    },
    {
      ...sampleMetric,
      key: "error_rate",
      name: "Error Rate",
      current: 1.8,
    },
    {
      ...sampleMetric,
      key: "availability",
      name: "Availability",
      current: 99.72,
    },
  ],
  alerts: [sampleAlert],
  incidents: [sampleIncident],
  errors: [],
  alertSummary: { critical: 1, high: 1, medium: 0, low: 0, active: 2 },
};
