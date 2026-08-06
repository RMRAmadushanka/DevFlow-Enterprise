import type { Role } from "@/lib/permissions";

export type ProjectStatus = "active" | "completed" | "paused" | "archived" | "planning";

export type ProjectHealth = "healthy" | "at_risk" | "critical" | "unknown";

export type ProjectVisibility = "private" | "internal" | "public";

export type ProjectViewMode = "table" | "grid" | "compact";

export type ProjectSortField =
  | "name"
  | "newest"
  | "oldest"
  | "updated"
  | "activity"
  | "health"
  | "completion";

export type ProjectEnvironmentName = "development" | "testing" | "staging" | "production";

export interface ProjectFilters {
  q: string;
  status: ProjectStatus | "all";
  ownerId: string | null;
  teamId: string | null;
  visibility: ProjectVisibility | "all";
  technology: string | null;
  language: string | null;
  archived: boolean | "all";
  favoritesOnly: boolean;
  organizationId: string | null;
}

export interface ProjectMember {
  id: string;
  projectId: string;
  userId: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role: Role;
  capacity: number;
  lastActiveAt: string;
}

export interface ProjectMilestone {
  id: string;
  title: string;
  dueDate: string;
  status: "upcoming" | "in_progress" | "completed" | "overdue";
  progress: number;
}

export interface ProjectActivityItem {
  id: string;
  type:
    | "created"
    | "member_added"
    | "repository_connected"
    | "deployment"
    | "status_changed"
    | "milestone"
    | "updated";
  actorName: string;
  summary: string;
  timestamp: string;
  meta?: string;
}

export interface ProjectRepository {
  url: string;
  defaultBranch: string;
  latestCommit: string;
  latestCommitMessage: string;
  latestRelease?: string;
  branchCount: number;
  openPullRequests: number;
  health: ProjectHealth;
}

export interface ProjectEnvironment {
  id: string;
  name: ProjectEnvironmentName;
  status: "healthy" | "degraded" | "down" | "idle";
  latestDeployment?: string;
  version?: string;
  health: ProjectHealth;
  updatedAt: string;
}

export interface ProjectStatistics {
  totalTasks: number;
  completedTasks: number;
  openBugs: number;
  sprintProgress: number;
  velocity: number;
  deployments: number;
  contributors: number;
  cycleTimeDays: number;
}

export interface ProjectAnalytics {
  taskCompletionTrend: Array<{ label: string; completed: number; opened: number }>;
  velocity: Array<{ label: string; points: number }>;
  burndown: Array<{ label: string; remaining: number; ideal: number }>;
  workload: Array<{ label: string; assigned: number; completed: number }>;
  issueDistribution: Array<{ name: string; value: number }>;
  healthScore: number;
}

export interface Project {
  id: string;
  organizationId: string;
  key: string;
  name: string;
  description: string;
  status: ProjectStatus;
  health: ProjectHealth;
  visibility: ProjectVisibility;
  progress: number;
  ownerId: string;
  ownerName: string;
  teamId?: string;
  teamName?: string;
  logoUrl?: string;
  color: string;
  icon?: string;
  repositoryUrl?: string;
  defaultBranch: string;
  technologyStack: string[];
  language?: string;
  timezone: string;
  startDate?: string;
  endDate?: string;
  tags: string[];
  labels: string[];
  memberCount: number;
  taskCount: number;
  completedTaskCount: number;
  favorite: boolean;
  archived: boolean;
  createdAt: string;
  updatedAt: string;
  lastActivityAt: string;
}

export interface ProjectDetail extends Project {
  statistics: ProjectStatistics;
  milestones: ProjectMilestone[];
  members: ProjectMember[];
  activity: ProjectActivityItem[];
  repository?: ProjectRepository;
  environments: ProjectEnvironment[];
  analytics: ProjectAnalytics;
  upcomingReleases: Array<{ id: string; name: string; date: string; status: string }>;
}

export interface CreateProjectPayload {
  name: string;
  key: string;
  description: string;
  organizationId: string;
  teamId?: string;
  visibility: ProjectVisibility;
  repositoryUrl?: string;
  defaultBranch: string;
  technologyStack: string[];
  color: string;
  icon?: string;
  timezone: string;
  startDate?: string;
  endDate?: string;
  tags: string[];
  labels: string[];
}

export type UpdateProjectPayload = Partial<CreateProjectPayload> & {
  status?: ProjectStatus;
};

export interface ProjectListResult {
  items: Project[];
  total: number;
}
