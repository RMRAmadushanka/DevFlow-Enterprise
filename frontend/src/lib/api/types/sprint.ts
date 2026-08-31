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
