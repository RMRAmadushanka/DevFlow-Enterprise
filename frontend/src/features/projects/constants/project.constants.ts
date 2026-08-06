import { createQueryKeys } from "@/lib/api/query-keys";
import type { SettingsNavItem } from "@/components/layout/page-templates";
import { routes } from "@/config/routes";

import type {
  ProjectFilters,
  ProjectHealth,
  ProjectSortField,
  ProjectStatus,
  ProjectVisibility,
} from "../types/project.types";

export const PROJECT_STORAGE_KEY = "devflow.projects.ui";

export const projectKeys = {
  ...createQueryKeys("projects"),
  members: (id: string) => [...createQueryKeys("projects").detail(id), "members"] as const,
  activity: (id: string) => [...createQueryKeys("projects").detail(id), "activity"] as const,
  analytics: (id: string) => [...createQueryKeys("projects").detail(id), "analytics"] as const,
  repository: (id: string) => [...createQueryKeys("projects").detail(id), "repository"] as const,
  environments: (id: string) => [...createQueryKeys("projects").detail(id), "environments"] as const,
};

export const DEFAULT_PROJECT_FILTERS: ProjectFilters = {
  q: "",
  status: "all",
  ownerId: null,
  teamId: null,
  visibility: "all",
  technology: null,
  language: null,
  archived: false,
  favoritesOnly: false,
  organizationId: null,
};

export const STATUS_OPTIONS: Array<{ value: ProjectStatus | "all"; label: string }> = [
  { value: "all", label: "All statuses" },
  { value: "planning", label: "Planning" },
  { value: "active", label: "Active" },
  { value: "paused", label: "Paused" },
  { value: "completed", label: "Completed" },
  { value: "archived", label: "Archived" },
];

export const VISIBILITY_OPTIONS: Array<{ value: ProjectVisibility | "all"; label: string }> = [
  { value: "all", label: "All visibility" },
  { value: "private", label: "Private" },
  { value: "internal", label: "Internal" },
  { value: "public", label: "Public" },
];

export const SORT_OPTIONS: Array<{ value: ProjectSortField; label: string }> = [
  { value: "name", label: "Name" },
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "updated", label: "Last updated" },
  { value: "activity", label: "Activity" },
  { value: "health", label: "Health" },
  { value: "completion", label: "Completion" },
];

export const TECHNOLOGY_OPTIONS = [
  { value: "nextjs", label: "Next.js" },
  { value: "react", label: "React" },
  { value: "node", label: "Node.js" },
  { value: "python", label: "Python" },
  { value: "go", label: "Go" },
  { value: "kotlin", label: "Kotlin" },
];

export const LANGUAGE_OPTIONS = [
  { value: "TypeScript", label: "TypeScript" },
  { value: "JavaScript", label: "JavaScript" },
  { value: "Python", label: "Python" },
  { value: "Go", label: "Go" },
  { value: "Kotlin", label: "Kotlin" },
];

export const TIMEZONE_OPTIONS = [
  { value: "UTC", label: "UTC" },
  { value: "America/New_York", label: "America/New_York" },
  { value: "America/Los_Angeles", label: "America/Los_Angeles" },
  { value: "Europe/London", label: "Europe/London" },
  { value: "Asia/Kolkata", label: "Asia/Kolkata" },
];

export const HEALTH_LABELS: Record<ProjectHealth, string> = {
  healthy: "Healthy",
  at_risk: "At risk",
  critical: "Critical",
  unknown: "Unknown",
};

export function projectSettingsNav(projectId: string): SettingsNavItem[] {
  return [
    { id: "general", label: "General", href: routes.app.projectSettings(projectId) },
    { id: "members", label: "Members", href: routes.app.projectMembers(projectId) },
    { id: "repository", label: "Repository", href: routes.app.projectRepository(projectId) },
    { id: "environments", label: "Environments", href: routes.app.projectEnvironments(projectId) },
  ];
}

export const PROJECT_DETAIL_TABS = [
  { value: "overview", label: "Overview" },
  { value: "tasks", label: "Tasks" },
  { value: "sprints", label: "Sprints" },
  { value: "members", label: "Members" },
  { value: "repository", label: "Repository" },
  { value: "deployments", label: "Deployments" },
  { value: "analytics", label: "Analytics" },
  { value: "documents", label: "Documents" },
  { value: "settings", label: "Settings" },
  { value: "activity", label: "Activity" },
] as const;
