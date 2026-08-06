import type { DateRangeValue } from "@/components/dashboard";
import type { Tone } from "@/components/data-display/shared/types";

export type DashboardWidgetId =
  | "quick-actions"
  | "overview-metrics"
  | "project-overview"
  | "project-status"
  | "team-activity"
  | "deployment-summary"
  | "deployment-trend"
  | "sprint-progress"
  | "sprint-burndown"
  | "workload"
  | "workload-chart"
  | "recent-projects"
  | "recent-activity";

export type ProjectStatus = "active" | "completed" | "paused" | "archived";

export type DeploymentStatus = "success" | "failed" | "building" | "cancelled";

export type DashboardEnvironment = "production" | "staging" | "preview" | "development";

export interface DashboardFilters {
  organizationId: string | null;
  teamId: string | null;
  projectId: string | null;
  environment: DashboardEnvironment | null;
  dateRange: DateRangeValue;
}

export interface DashboardMetric {
  id: string;
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  trend?: "up" | "down" | "flat";
  variant?: "default" | "success" | "warning" | "danger";
  description?: string;
}

export interface DashboardProject {
  id: string;
  name: string;
  status: ProjectStatus;
  progress: number;
  memberCount: number;
  owner: string;
  lastActivityAt: string;
  updatedAt: string;
}

export interface DashboardActivityItem {
  id: string;
  userName: string;
  userAvatarUrl?: string;
  action: string;
  description?: string;
  timestamp: string;
  meta?: string;
}

export interface DashboardDeployment {
  id: string;
  environment: DashboardEnvironment;
  version: string;
  status: DeploymentStatus;
  deployedAt: string;
  author: string;
  projectName: string;
}

export interface DashboardSprint {
  id: string;
  name: string;
  completionPercent: number;
  remainingDays: number;
  tasksCompleted: number;
  tasksRemaining: number;
  endsAt: string;
}

export interface WorkloadMember {
  id: string;
  name: string;
  avatarUrl?: string;
  assignedTasks: number;
  completedTasks: number;
  capacity: number;
}

export interface ChartPoint {
  label: string;
  [key: string]: string | number | null;
}

export interface DonutSlice {
  name: string;
  value: number;
  color?: string;
}

export interface DashboardSnapshot {
  metrics: DashboardMetric[];
  projects: DashboardProject[];
  projectStatus: DonutSlice[];
  activity: DashboardActivityItem[];
  deployments: DashboardDeployment[];
  deploymentTrend: ChartPoint[];
  sprint: DashboardSprint | null;
  burndown: ChartPoint[];
  workload: WorkloadMember[];
  systemHealth: Array<{
    id: string;
    name: string;
    status: "healthy" | "warning" | "critical" | "offline";
    detail?: string;
  }>;
}

export interface DashboardFilterOptions {
  organizations: Array<{ value: string; label: string }>;
  teams: Array<{ value: string; label: string }>;
  projects: Array<{ value: string; label: string }>;
  environments: Array<{ value: DashboardEnvironment; label: string }>;
}

export interface DashboardPreferences {
  visibleWidgets: DashboardWidgetId[];
  widgetOrder: DashboardWidgetId[];
}

export type DeploymentTone = Tone;
