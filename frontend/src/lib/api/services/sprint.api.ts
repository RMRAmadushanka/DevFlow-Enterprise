import { apiClient } from "../client";
import type {
  BacklogItemDto,
  BurndownPointDto,
  CreateSprintRequest,
  MoveTasksToSprintRequest,
  PlanningStateDto,
  SprintActivityDto,
  SprintDto,
  SprintListQuery,
  SprintPage,
  SprintStatusUpdateRequest,
  UpdateSprintRequest,
  VelocityPointDto,
} from "../types/sprint";

function toQuery(
  query?: SprintListQuery
): Record<string, string | number | boolean | null | undefined> | undefined {
  if (!query) return undefined;
  return {
    projectId: query.projectId,
    organizationId: query.organizationId,
    status: query.status,
    archived: query.archived,
    search: query.search,
    page: query.page,
    size: query.size,
    sort: query.sort,
  };
}

/** Typed Gateway client for sprint-service (`/api/sprints`). */
export const sprintApi = {
  createSprint(body: CreateSprintRequest): Promise<SprintDto> {
    return apiClient<SprintDto>("/api/sprints", { method: "POST", body });
  },

  getSprints(query?: SprintListQuery): Promise<SprintPage> {
    return apiClient<SprintPage>("/api/sprints", { query: toQuery(query) });
  },

  getSprint(sprintId: string): Promise<SprintDto> {
    return apiClient<SprintDto>(`/api/sprints/${sprintId}`);
  },

  updateSprint(sprintId: string, body: UpdateSprintRequest): Promise<SprintDto> {
    return apiClient<SprintDto>(`/api/sprints/${sprintId}`, { method: "PATCH", body });
  },

  deleteSprint(sprintId: string): Promise<void> {
    return apiClient<void>(`/api/sprints/${sprintId}`, { method: "DELETE" });
  },

  updateSprintStatus(sprintId: string, status: string): Promise<SprintDto> {
    return apiClient<SprintDto>(`/api/sprints/${sprintId}/status`, {
      method: "PATCH",
      body: { status } satisfies SprintStatusUpdateRequest,
    });
  },

  startSprint(sprintId: string): Promise<SprintDto> {
    return apiClient<SprintDto>(`/api/sprints/${sprintId}/start`, { method: "POST" });
  },

  completeSprint(sprintId: string): Promise<SprintDto> {
    return apiClient<SprintDto>(`/api/sprints/${sprintId}/complete`, { method: "POST" });
  },

  archiveSprint(sprintId: string): Promise<SprintDto> {
    return apiClient<SprintDto>(`/api/sprints/${sprintId}/archive`, { method: "PATCH" });
  },

  getBurndown(sprintId: string): Promise<BurndownPointDto[]> {
    return apiClient<BurndownPointDto[]>(`/api/sprints/${sprintId}/burndown`);
  },

  getVelocityHistory(projectId: string, limit?: number): Promise<VelocityPointDto[]> {
    return apiClient<VelocityPointDto[]>("/api/sprints/velocity-history", {
      query: { projectId, limit },
    });
  },

  getPlanning(sprintId: string): Promise<PlanningStateDto> {
    return apiClient<PlanningStateDto>(`/api/sprints/${sprintId}/planning`);
  },

  getBacklog(projectId: string): Promise<BacklogItemDto[]> {
    return apiClient<BacklogItemDto[]>("/api/sprints/backlog", { query: { projectId } });
  },

  moveTasksToSprint(
    sprintId: string,
    taskIds: string[],
    projectId: string
  ): Promise<PlanningStateDto> {
    return apiClient<PlanningStateDto>(`/api/sprints/${sprintId}/move-tasks`, {
      method: "POST",
      body: { taskIds, projectId } satisfies MoveTasksToSprintRequest,
    });
  },

  getActivity(sprintId: string, limit?: number): Promise<SprintActivityDto[]> {
    return apiClient<SprintActivityDto[]>(`/api/sprints/${sprintId}/activity`, {
      query: { limit },
    });
  },
};
