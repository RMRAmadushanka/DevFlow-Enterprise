import { createQueryKeys } from "@/lib/api/query-keys";

import type { SprintFilters, SprintSortField, SprintStatus } from "../types/sprint.types";

export const SPRINT_STORAGE_KEY = "devflow.sprints.ui";

export const sprintKeys = {
  ...createQueryKeys("sprints"),
  planning: (id: string) => [...createQueryKeys("sprints").detail(id), "planning"] as const,
  backlog: (projectId: string) =>
    [...createQueryKeys("sprints").all, "backlog", projectId] as const,
  releases: (projectId?: string | null) =>
    [...createQueryKeys("sprints").all, "releases", projectId ?? "all"] as const,
  reports: (id: string) => [...createQueryKeys("sprints").detail(id), "reports"] as const,
};

export const DEFAULT_SPRINT_FILTERS: SprintFilters = {
  q: "",
  projectId: null,
  status: "all",
  teamId: null,
  releaseId: null,
};

export const STATUS_LABELS: Record<SprintStatus, string> = {
  planning: "Planning",
  active: "Active",
  completed: "Completed",
  archived: "Archived",
};

export const STATUS_OPTIONS: Array<{ value: SprintStatus | "all"; label: string }> = [
  { value: "all", label: "All statuses" },
  { value: "planning", label: "Planning" },
  { value: "active", label: "Active" },
  { value: "completed", label: "Completed" },
  { value: "archived", label: "Archived" },
];

export const SORT_OPTIONS: Array<{ value: SprintSortField; label: string }> = [
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "start_date", label: "Start date" },
  { value: "end_date", label: "End date" },
  { value: "velocity", label: "Velocity" },
  { value: "completion", label: "Completion" },
];

export const PROJECT_OPTIONS = [
  { value: "proj_api", label: "API Gateway" },
  { value: "proj_web", label: "Web Console" },
  { value: "proj_mobile", label: "Mobile App" },
  { value: "proj_infra", label: "Infrastructure" },
  { value: "proj_docs", label: "Docs Portal" },
];

export const SPRINT_DETAIL_TABS = [
  { value: "overview", label: "Overview" },
  { value: "board", label: "Board" },
  { value: "reports", label: "Reports" },
  { value: "members", label: "Members" },
  { value: "activity", label: "Activity" },
  { value: "settings", label: "Settings" },
] as const;
