import type {
  AnalyticsOverview,
  CreateReportPayload,
  MonitoringFilters,
  ReportDefinition,
} from "../types/monitoring.types";
import { makeSeries } from "../utils/format";
import { MonitoringNotFoundError, MonitoringValidationError } from "../utils/errors";

const delay = (ms = 220) => new Promise((resolve) => setTimeout(resolve, ms));

let reports: ReportDefinition[] = [
  {
    id: "rep_1",
    name: "Weekly engineering digest",
    description: "Velocity, deployments, and incident summary.",
    category: "engineering",
    metrics: ["velocity", "deployments", "incidents"],
    schedule: "Every Monday 09:00",
    lastExportedAt: "2026-08-04T09:00:00.000Z",
    createdAt: "2026-06-01T10:00:00.000Z",
    createdBy: "Ava Chen",
  },
  {
    id: "rep_2",
    name: "Executive platform health",
    description: "Success rates and utilization for leadership.",
    category: "executive",
    metrics: ["availability", "utilization", "deployments"],
    schedule: "First of month",
    lastExportedAt: "2026-08-01T08:00:00.000Z",
    createdAt: "2026-05-01T10:00:00.000Z",
    createdBy: "Mia Patel",
  },
  {
    id: "rep_3",
    name: "Security audit export",
    description: "Failed auth and permission changes.",
    category: "security",
    metrics: ["errors", "incidents"],
    createdAt: "2026-07-12T10:00:00.000Z",
    createdBy: "Noah Kim",
  },
];

export const analyticsService = {
  async getOverview(_filters: MonitoringFilters): Promise<AnalyticsOverview> {
    await delay();
    return {
      engineeringVelocity: 38,
      deploymentSuccessRate: 96.4,
      openIncidents: 2,
      projectSuccessRate: 88,
      teamUtilization: 74,
      platformHealth: "degraded",
      sprintCompletion: 81,
      repoActivity: 126,
      errorTrend: makeSeries(36, 14),
      deploymentTrend: makeSeries(12, 4),
      velocityTrend: makeSeries(34, 6),
    };
  },

  async listReports(): Promise<ReportDefinition[]> {
    await delay(160);
    return [...reports];
  },

  async createReport(payload: CreateReportPayload): Promise<ReportDefinition> {
    await delay(260);
    if (!payload.name.trim()) throw new MonitoringValidationError("Report name is required");
    if (!payload.metrics.length) {
      throw new MonitoringValidationError("Select at least one metric");
    }
    const report: ReportDefinition = {
      id: `rep_${Math.random().toString(36).slice(2, 9)}`,
      name: payload.name.trim(),
      description: payload.description?.trim() ?? "",
      category: payload.category,
      metrics: payload.metrics,
      schedule: payload.schedule || undefined,
      createdAt: new Date().toISOString(),
      createdBy: "Ava Chen",
    };
    reports = [report, ...reports];
    return report;
  },

  async exportReport(id: string, format: "pdf" | "csv"): Promise<{ id: string; format: string }> {
    await delay(300);
    const report = reports.find((r) => r.id === id);
    if (!report) throw new MonitoringNotFoundError("Report not found");
    report.lastExportedAt = new Date().toISOString();
    return { id, format };
  },
};
