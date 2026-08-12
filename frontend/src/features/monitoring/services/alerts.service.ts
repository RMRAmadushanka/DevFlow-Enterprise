import type {
  Alert,
  CreateAlertPayload,
  MonitoringFilters,
  UpdateAlertPayload,
} from "../types/monitoring.types";
import { MonitoringNotFoundError, MonitoringValidationError } from "../utils/errors";
import { isLiveBackendMode, rejectStubMutation } from "@/lib/api/live-api";

const delay = (ms = 220) => new Promise((resolve) => setTimeout(resolve, ms));

let alerts: Alert[] = [
  {
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
  },
  {
    id: "alert_2",
    name: "Task service error rate",
    description: "Error rate above 2% in production.",
    severity: "critical",
    status: "active",
    service: "tasks",
    metric: "error_rate",
    threshold: 2,
    condition: "gt",
    notificationChannel: "slack",
    createdAt: "2026-07-01T09:00:00.000Z",
    lastTriggeredAt: "2026-08-06T14:00:00.000Z",
    triggeredCount: 6,
  },
  {
    id: "alert_3",
    name: "Disk usage warning",
    description: "Disk utilization over 80%.",
    severity: "medium",
    status: "acknowledged",
    service: "repositories",
    metric: "disk",
    threshold: 80,
    condition: "gte",
    notificationChannel: "email",
    createdAt: "2026-06-15T11:00:00.000Z",
    lastTriggeredAt: "2026-08-03T08:00:00.000Z",
    triggeredCount: 3,
  },
  {
    id: "alert_4",
    name: "Auth availability drop",
    description: "Availability below 99.5%.",
    severity: "critical",
    status: "resolved",
    service: "authentication",
    metric: "availability",
    threshold: 99.5,
    condition: "lt",
    notificationChannel: "pagerduty",
    createdAt: "2026-05-10T10:00:00.000Z",
    lastTriggeredAt: "2026-07-28T16:00:00.000Z",
    triggeredCount: 2,
  },
  {
    id: "alert_5",
    name: "CPU saturation",
    description: "CPU above 85% for 10 minutes.",
    severity: "low",
    status: "disabled",
    service: "analytics",
    metric: "cpu",
    threshold: 85,
    condition: "gte",
    notificationChannel: "webhook",
    createdAt: "2026-04-01T10:00:00.000Z",
    triggeredCount: 0,
  },
];

function matches(alert: Alert, filters: MonitoringFilters): boolean {
  if (filters.service !== "all" && alert.service !== filters.service) return false;
  if (filters.severity !== "all" && alert.severity !== filters.severity) return false;
  if (filters.status !== "all" && alert.status !== filters.status) return false;
  const q = filters.q.trim().toLowerCase();
  if (q && !`${alert.name} ${alert.description} ${alert.service}`.toLowerCase().includes(q)) {
    return false;
  }
  return true;
}

export const alertsService = {
  async list(filters: MonitoringFilters): Promise<Alert[]> {
    if (isLiveBackendMode()) return [];
    await delay();
    return alerts.filter((a) => matches(a, filters));
  },

  async getById(id: string): Promise<Alert> {
    await delay(120);
    const alert = alerts.find((a) => a.id === id);
    if (!alert) throw new MonitoringNotFoundError("Alert not found");
    return alert;
  },

  async create(payload: CreateAlertPayload): Promise<Alert> {
    if (isLiveBackendMode()) rejectStubMutation("Monitoring alerts");
    await delay(280);
    if (!payload.name.trim()) throw new MonitoringValidationError("Alert name is required");
    const alert: Alert = {
      id: `alert_${Math.random().toString(36).slice(2, 9)}`,
      name: payload.name.trim(),
      description: payload.description?.trim() ?? "",
      severity: payload.severity,
      status: "active",
      service: payload.service,
      metric: payload.metric,
      threshold: payload.threshold,
      condition: payload.condition,
      notificationChannel: payload.notificationChannel || "email",
      createdAt: new Date().toISOString(),
      triggeredCount: 0,
    };
    alerts = [alert, ...alerts];
    return alert;
  },

  async update(id: string, payload: UpdateAlertPayload): Promise<Alert> {
    if (isLiveBackendMode()) rejectStubMutation("Monitoring alerts");
    await delay(240);
    const index = alerts.findIndex((a) => a.id === id);
    if (index < 0) throw new MonitoringNotFoundError("Alert not found");
    const current = alerts[index]!;
    const updated: Alert = {
      ...current,
      ...payload,
      name: payload.name?.trim() ?? current.name,
      description: payload.description ?? current.description,
    };
    alerts[index] = updated;
    return updated;
  },

  async delete(id: string): Promise<void> {
    if (isLiveBackendMode()) rejectStubMutation("Monitoring alerts");
    await delay(180);
    if (!alerts.some((a) => a.id === id)) throw new MonitoringNotFoundError("Alert not found");
    alerts = alerts.filter((a) => a.id !== id);
  },

  async history(id: string): Promise<Array<{ id: string; at: string; summary: string }>> {
    await delay(160);
    await this.getById(id);
    return [
      { id: "h1", at: "2026-08-06T15:45:00.000Z", summary: "Triggered — threshold exceeded" },
      { id: "h2", at: "2026-08-05T11:00:00.000Z", summary: "Acknowledged by Ava Chen" },
      { id: "h3", at: "2026-08-04T09:00:00.000Z", summary: "Resolved after deploy rollback" },
    ];
  },
};
