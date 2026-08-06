import type { DateRangePreset } from "@/components/dashboard";

import type { DashboardPreferences, DashboardWidgetId } from "../types/dashboard.types";

export const DASHBOARD_STORAGE_KEY = "devflow.dashboard.preferences";

export const DASHBOARD_WIDGET_IDS: DashboardWidgetId[] = [
  "quick-actions",
  "overview-metrics",
  "project-overview",
  "project-status",
  "team-activity",
  "deployment-summary",
  "deployment-trend",
  "sprint-progress",
  "sprint-burndown",
  "workload",
  "workload-chart",
  "recent-projects",
  "recent-activity",
];

export const WIDGET_LABELS: Record<DashboardWidgetId, string> = {
  "quick-actions": "Quick actions",
  "overview-metrics": "Overview metrics",
  "project-overview": "Project overview",
  "project-status": "Project status chart",
  "team-activity": "Team activity",
  "deployment-summary": "Deployment summary",
  "deployment-trend": "Deployment trend",
  "sprint-progress": "Sprint progress",
  "sprint-burndown": "Sprint burndown",
  "workload": "Team workload",
  "workload-chart": "Workload chart",
  "recent-projects": "Recent projects",
  "recent-activity": "Recent activity",
};

export const DEFAULT_DASHBOARD_PREFERENCES: DashboardPreferences = {
  visibleWidgets: [...DASHBOARD_WIDGET_IDS],
  widgetOrder: [...DASHBOARD_WIDGET_IDS],
};

export const DATE_RANGE_PRESETS: DateRangePreset[] = ["today", "7d", "30d", "90d"];

export const dashboardKeys = {
  all: ["dashboard"] as const,
  snapshot: (filters: unknown) => [...dashboardKeys.all, "snapshot", filters] as const,
  filterOptions: () => [...dashboardKeys.all, "filter-options"] as const,
};
