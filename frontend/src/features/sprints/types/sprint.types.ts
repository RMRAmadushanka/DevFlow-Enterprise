export type SprintStatus = "planning" | "active" | "completed" | "archived";

export type SprintHealth = "healthy" | "at_risk" | "critical" | "unknown";

export type SprintSortField =
  | "newest"
  | "oldest"
  | "start_date"
  | "end_date"
  | "velocity"
  | "completion";

export type ReleaseStatus = "planned" | "in_progress" | "released" | "delayed";

export interface SprintFilters {
  q: string;
  projectId: string | null;
  status: SprintStatus | "all";
  teamId: string | null;
  releaseId: string | null;
}

export interface SprintMemberCapacity {
  userId: string;
  name: string;
  avatarUrl?: string;
  capacityPoints: number;
  allocatedPoints: number;
  availability: number;
}

export interface SprintMetrics {
  committedPoints: number;
  completedPoints: number;
  remainingPoints: number;
  totalTasks: number;
  completedTasks: number;
  remainingTasks: number;
  velocity: number;
  capacityPoints: number;
  progress: number;
  health: SprintHealth;
  remainingDays: number;
}

export interface BurndownPoint {
  label: string;
  remaining: number;
  ideal: number;
}

export interface BurnupPoint {
  label: string;
  completed: number;
  scope: number;
}

export interface VelocityPoint {
  label: string;
  committed: number;
  completed: number;
}

export interface Sprint {
  id: string;
  name: string;
  goal: string;
  description: string;
  projectId: string;
  projectName: string;
  status: SprintStatus;
  startDate: string;
  endDate: string;
  capacityPoints: number;
  storyPointGoal: number;
  completedPoints: number;
  committedPoints: number;
  taskCount: number;
  completedTaskCount: number;
  velocity: number;
  health: SprintHealth;
  releaseId?: string;
  releaseName?: string;
  archived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SprintDetail extends Sprint {
  metrics: SprintMetrics;
  burndown: BurndownPoint[];
  burnup: BurnupPoint[];
  capacity: SprintMemberCapacity[];
  taskIds: string[];
  activity: Array<{
    id: string;
    actorName: string;
    summary: string;
    timestamp: string;
  }>;
  review?: SprintReview;
  retrospective?: SprintRetrospective;
}

export interface SprintReview {
  velocity: number;
  completedPoints: number;
  incompleteCount: number;
  deploymentSummary: string;
  teamPerformance: string;
}

export interface RetroItem {
  id: string;
  text: string;
  votes: number;
  authorName: string;
  votedByCurrentUser?: boolean;
}

export interface SprintRetrospective {
  wentWell: RetroItem[];
  needsImprovement: RetroItem[];
  actionItems: RetroItem[];
  comments: Array<{ id: string; authorName: string; body: string; timestamp: string }>;
}

export interface BacklogItem {
  id: string;
  key: string;
  title: string;
  priority: "critical" | "high" | "medium" | "low" | "none";
  status: string;
  storyPoints?: number;
  epicName?: string;
  sprintId?: string | null;
  assigneeName?: string;
  projectId: string;
}

export interface Release {
  id: string;
  name: string;
  version: string;
  projectId: string;
  projectName: string;
  releaseDate: string;
  status: ReleaseStatus;
  sprintIds: string[];
  featureNames: string[];
  description: string;
}

export interface CreateReleasePayload {
  projectId: string;
  name: string;
  version?: string;
  description?: string;
  status: ReleaseStatus;
  releaseDate?: string;
  features?: string[];
}

export type UpdateReleasePayload = Partial<Omit<CreateReleasePayload, "projectId">>;

export interface CreateSprintPayload {
  name: string;
  goal: string;
  description?: string;
  projectId: string;
  startDate: string;
  endDate: string;
  capacityPoints: number;
  storyPointGoal: number;
  releaseId?: string | null;
}

export type UpdateSprintPayload = Partial<CreateSprintPayload> & {
  status?: SprintStatus;
  archived?: boolean;
};

export interface SprintListResult {
  items: Sprint[];
  total: number;
  current?: Sprint | null;
  upcoming: Sprint[];
  completed: Sprint[];
  archived: Sprint[];
}

export interface PlanningState {
  backlog: BacklogItem[];
  sprintTasks: BacklogItem[];
  capacityPoints: number;
  allocatedPoints: number;
}
