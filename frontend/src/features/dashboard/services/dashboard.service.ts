import { isLiveBackendMode, rejectStubMutation } from "@/lib/api/live-api";
import {
  MOCK_FILTER_OPTIONS,
  MOCK_SNAPSHOT,
} from "../constants/mock-data";
import type {
  DashboardFilters,
  DashboardFilterOptions,
  DashboardSnapshot,
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
