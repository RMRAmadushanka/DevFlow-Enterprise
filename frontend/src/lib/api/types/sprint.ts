/**
 * Sprint DTO shapes matching sprint-service `/api/sprints`.
 */

export interface SprintDto {
  id: string;
  name: string;
  goal: string;
  description: string;
  projectId: string;
  projectName: string;
  status: string;
  startDate: string;
  endDate: string;
  capacityPoints: number;
  storyPointGoal: number;
  completedPoints: number;
  committedPoints: number;
  taskCount: number;
  completedTaskCount: number;
  velocity: number;
  health: string;
  archived: boolean;
  createdAt: string;
  updatedAt: string;
  releaseId?: string | null;
  releaseName?: string | null;
}

export interface CreateSprintRequest {
  name: string;
  goal?: string | null;
  description?: string | null;
  projectId: string;
  projectName: string;
  organizationId?: string | null;
  startDate: string;
  endDate: string;
  capacityPoints: number;
  storyPointGoal: number;
  releaseId?: string | null;
}

export interface UpdateSprintRequest {
  name?: string;
  goal?: string | null;
  description?: string | null;
  projectId?: string;
  projectName?: string;
  organizationId?: string | null;
  startDate?: string;
  endDate?: string;
  capacityPoints?: number;
  storyPointGoal?: number;
  status?: string;
  archived?: boolean;
  releaseId?: string | null;
}

export interface SprintListQuery {
  projectId?: string;
  organizationId?: string;
  status?: string;
  archived?: boolean;
  search?: string;
  page?: number;
  size?: number;
  sort?: string;
}

export type SprintPage = import("./envelope").PageResponse<SprintDto>;

export interface SprintStatusUpdateRequest {
  status: string;
}

export interface BurndownPointDto {
  date: string;
  remainingPoints: number;
  idealPoints: number;
  completedPoints: number;
  synthesized: boolean;
}

export interface VelocityPointDto {
  sprintId: string;
  sprintName: string;
  endDate: string;
  committedPoints: number;
  completedPoints: number;
}

export interface BacklogItemDto {
  id: string;
  key: string;
  title: string;
  priority: string;
  status: string;
  storyPoints: number | null;
  epicName?: string | null;
  sprintId: string | null;
  assigneeName?: string | null;
  projectId: string;
}

export interface PlanningStateDto {
  backlog: BacklogItemDto[];
  sprintTasks: BacklogItemDto[];
  capacityPoints: number;
  allocatedPoints: number;
}

export interface MoveTasksToSprintRequest {
  taskIds: string[];
  projectId: string;
}

export interface SprintActivityDto {
  id: string;
  actorId: string | null;
  actorName: string | null;
  type: string;
  summary: string;
  createdAt: string;
}

export type RetroColumnType = "WENT_WELL" | "NEEDS_IMPROVEMENT" | "ACTION_ITEM";

export interface RetroItemDto {
  id: string;
  columnType: RetroColumnType | string;
  text: string;
  authorId?: string | null;
  authorName: string;
  createdAt: string;
  voteCount: number;
  votedByCurrentUser: boolean;
}

export interface RetroCommentDto {
  id: string;
  authorName: string;
  text: string;
  createdAt: string;
}

export interface RetrospectiveDto {
  items: RetroItemDto[];
  comments: RetroCommentDto[];
}

export interface CreateRetroItemRequest {
  columnType: RetroColumnType;
  text: string;
}

export interface CreateRetroCommentRequest {
  text: string;
}

export interface SprintReviewDto {
  velocity: number;
  completedPoints: number;
  incompleteCount: number;
  deploymentSummary: string | null;
  teamPerformance: string | null;
}

export interface UpdateReviewRequest {
  deploymentSummary?: string | null;
  teamPerformance?: string | null;
}

export interface CapacityMemberDto {
  userId: string;
  userName: string;
  capacityPoints: number;
  allocatedPoints: number;
}

export interface SprintCapacityDto {
  members: CapacityMemberDto[];
}

export interface UpdateCapacityMemberRequest {
  userId: string;
  userName: string;
  capacityPoints: number;
}

export interface UpdateCapacityRequest {
  members: UpdateCapacityMemberRequest[];
}

export interface CompleteSprintRequest {
  moveIncompleteToBacklog?: boolean;
}

export interface ReorderBacklogRequest {
  projectId: string;
  orderedTaskIds: string[];
}
