import { analyticsApi } from "@/lib/api";
import { rejectStubMutation, resolveLiveApiFlag } from "@/lib/api/live-api";
import { useOrganizationStore } from "@/features/organization/store/organization.store";

import type {
  AnalyticsOverview,
  CreateReportPayload,
  MetricPoint,
  MonitoringFilters,
  ReportDefinition,
} from "../types/monitoring.types";
import { makeSeries } from "../utils/format";
import { MonitoringNotFoundError, MonitoringValidationError } from "../utils/errors";

const delay = (ms = 220) => new Promise((resolve) => setTimeout(resolve, ms));

export function isAnalyticsApiEnabled(): boolean {
  return resolveLiveApiFlag(process.env.NEXT_PUBLIC_USE_ANALYTICS_API);
}

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

const mockAnalyticsService = {
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

/** Live adapter — sourced from analytics-service (`/api/v1/analytics`). */
const liveAnalyticsService = {
  async getOverview(filters: MonitoringFilters): Promise<AnalyticsOverview> {
    const organizationId = useOrganizationStore.getState().currentOrganizationId ?? undefined;
    const projectId = filters.projectId ?? undefined;
    const points = await analyticsApi
      .getVelocityTrend(organizationId, projectId, 6)
      .catch((error) => {
        console.error("Failed to load velocity trend", error);
        return [];
      });
    const velocityTrend: MetricPoint[] = points.map((point) => ({
      label: point.sprintName,
      value: point.completedPoints ?? 0,
      secondary: point.committedPoints ?? 0,
    }));

    // Only velocity trend is sourced from analytics-service so far — the rest of
    // this stub domain's metrics have no live backend yet, so they stay blank
    // rather than showing stale mock numbers.
    return {
      engineeringVelocity: 0,
      deploymentSuccessRate: 0,
      openIncidents: 0,
      projectSuccessRate: 0,
      teamUtilization: 0,
      platformHealth: "unknown",
      sprintCompletion: 0,
      repoActivity: 0,
      errorTrend: [],
      deploymentTrend: [],
      velocityTrend,
    };
  },

  async listReports(): Promise<ReportDefinition[]> {
    return [];
  },

  async createReport(): Promise<ReportDefinition> {
    rejectStubMutation("Custom analytics reports");
  },

  async exportReport(): Promise<{ id: string; format: string }> {
    rejectStubMutation("Analytics report export");
  },
};

export const analyticsService = new Proxy(mockAnalyticsService, {
  get(target, prop, receiver) {
    if (isAnalyticsApiEnabled()) {
      const live = Reflect.get(liveAnalyticsService, prop, liveAnalyticsService);
      if (typeof live === "function") {
        return (live as (...args: unknown[]) => unknown).bind(liveAnalyticsService);
      }
    }
    const value = Reflect.get(target, prop, receiver);
    return typeof value === "function" ? value.bind(target) : value;
  },
});
