import { analyticsApi } from "@/lib/api";
import { isLiveBackendMode, rejectStubMutation } from "@/lib/api/live-api";
import type { DashboardSnapshotDto } from "@/lib/api/types/analytics";
import { isAnalyticsApiEnabled } from "@/features/monitoring/services/analytics.service";
import { useOrganizationStore } from "@/features/organization/store/organization.store";

import {
  MOCK_FILTER_OPTIONS,
  MOCK_SNAPSHOT,
} from "../constants/mock-data";
import type {
  DashboardFilters,
  DashboardFilterOptions,
  DashboardSnapshot,
  DashboardSprint,
} from "../types/dashboard.types";
import { DashboardNetworkError } from "../utils/errors";

const delay = (ms = 400) => new Promise((resolve) => setTimeout(resolve, ms));

const EMPTY_SNAPSHOT: DashboardSnapshot = {
  metrics: [],
  projects: [],
  projectStatus: [],
  activity: [],
  deployments: [],
  deploymentTrend: [],
  sprint: null,
  burndown: [],
  workload: [],
  systemHealth: [],
};

const EMPTY_FILTER_OPTIONS: DashboardFilterOptions = {
  organizations: [],
  teams: [],
  projects: [],
  environments: [
    { value: "production", label: "Production" },
    { value: "staging", label: "Staging" },
    { value: "preview", label: "Preview" },
    { value: "development", label: "Development" },
  ],
};

function cloneSnapshot(): DashboardSnapshot {
  return structuredClone(MOCK_SNAPSHOT);
}

function daysUntil(dateStr: string): number {
  const end = new Date(`${dateStr}T00:00:00.000Z`).getTime();
  if (Number.isNaN(end)) return 0;
  return Math.max(0, Math.ceil((end - Date.now()) / (1000 * 60 * 60 * 24)));
}

/**
 * analytics-service's dashboard snapshot only projects raw sprint fields
 * (points, dates, status) — no precomputed UI metrics. Completion % and
 * remaining days are derived here; per-task counts aren't available from
 * this endpoint at all (points aren't a 1:1 stand-in for task counts), so
 * they're left at 0 rather than fabricated.
 */
function mapDashboardSprint(dto: DashboardSnapshotDto["sprint"]): DashboardSprint | null {
  if (!dto) return null;
  const committed = dto.committedPoints ?? 0;
  const completed = dto.completedPoints ?? 0;
  return {
    id: dto.sprintId,
    name: dto.name,
    completionPercent: committed > 0 ? Math.round((completed / committed) * 100) : 0,
    remainingDays: daysUntil(dto.endDate),
    tasksCompleted: 0,
    tasksRemaining: 0,
    endsAt: dto.endDate,
  };
}

function mapDashboardBurndown(dto: DashboardSnapshotDto["burndown"]): DashboardSnapshot["burndown"] {
  return (dto ?? []).map((point) => ({
    label: point.date,
    remaining: point.remainingPoints ?? 0,
    ideal: point.idealPoints ?? 0,
  }));
}

/** Lightweight filter shaping for UI development — mock only. */
function applyFilters(snapshot: DashboardSnapshot, filters: DashboardFilters): DashboardSnapshot {
  let projects = snapshot.projects;
  let deployments = snapshot.deployments;

  if (filters.projectId) {
    projects = projects.filter((project) => project.id === filters.projectId);
    deployments = deployments.filter((deployment) => {
      const match = MOCK_FILTER_OPTIONS.projects.find((p) => p.value === filters.projectId);
      return match ? deployment.projectName === match.label : true;
    });
  }

  if (filters.environment) {
    deployments = deployments.filter((d) => d.environment === filters.environment);
  }

  if (filters.dateRange.preset === "today") {
    deployments = deployments.slice(0, 2);
  } else if (filters.dateRange.preset === "7d") {
    deployments = deployments.slice(0, 4);
  }

  const metrics = snapshot.metrics.map((metric) => {
    if (filters.organizationId === "org_startup" && metric.id === "active-projects") {
      return { ...metric, value: 6 };
    }
    if (filters.organizationId === "org_labs" && metric.id === "team-members") {
      return { ...metric, value: 12 };
    }
    return metric;
  });

  return {
    ...snapshot,
    metrics,
    projects,
    deployments,
  };
}

export const dashboardService = {
  async getFilterOptions(): Promise<DashboardFilterOptions> {
    if (isLiveBackendMode()) {
      return structuredClone(EMPTY_FILTER_OPTIONS);
    }
    await delay(200);
    return structuredClone(MOCK_FILTER_OPTIONS);
  },

  async getSnapshot(filters: DashboardFilters): Promise<DashboardSnapshot> {
    if (isAnalyticsApiEnabled()) {
      const organizationId =
        filters.organizationId ?? useOrganizationStore.getState().currentOrganizationId ?? undefined;
      if (!organizationId) {
        // No org context yet (e.g. org store hasn't hydrated on first render) — the endpoint
        // requires organizationId, so wait for a real value instead of firing a doomed request.
        return structuredClone(EMPTY_SNAPSHOT);
      }
      let dto: DashboardSnapshotDto;
      try {
        dto = await analyticsApi.getDashboardSnapshot(organizationId, filters.projectId ?? undefined);
      } catch (error) {
        console.error("Failed to load dashboard snapshot", error);
        return structuredClone(EMPTY_SNAPSHOT);
      }
      return {
        ...structuredClone(EMPTY_SNAPSHOT),
        sprint: mapDashboardSprint(dto.sprint),
        burndown: mapDashboardBurndown(dto.burndown),
      };
    }
    if (isLiveBackendMode()) {
      return structuredClone(EMPTY_SNAPSHOT);
    }
    await delay();
    if (filters.organizationId === "org_error") {
      throw new DashboardNetworkError();
    }
    return applyFilters(cloneSnapshot(), filters);
  },

  async exportReport(format: "pdf" | "csv" | "excel"): Promise<{ format: string; filename: string }> {
    if (isLiveBackendMode()) {
      rejectStubMutation("Dashboard export");
    }
    await delay(600);
    return {
      format,
      filename: `devflow-dashboard.${format === "excel" ? "xlsx" : format}`,
    };
  },
};
