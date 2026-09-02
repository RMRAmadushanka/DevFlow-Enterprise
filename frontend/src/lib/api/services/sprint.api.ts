import { apiClient } from "../client";
import type {
  BacklogItemDto,
  BurndownPointDto,
  CompleteSprintRequest,
  CreateRetroCommentRequest,
  CreateRetroItemRequest,
  CreateSprintRequest,
  MoveTasksToSprintRequest,
  PlanningStateDto,
  ReorderBacklogRequest,
  RetroItemDto,
  RetrospectiveDto,
  SprintActivityDto,
  SprintCapacityDto,
  SprintDto,
  SprintListQuery,
  SprintPage,
  SprintReviewDto,
  SprintStatusUpdateRequest,
  UpdateCapacityRequest,
  UpdateReviewRequest,
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

  completeSprint(sprintId: string, body?: CompleteSprintRequest): Promise<SprintDto> {
    return apiClient<SprintDto>(`/api/sprints/${sprintId}/complete`, {
      method: "POST",
      body,
    });
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

  getRetrospective(sprintId: string): Promise<RetrospectiveDto> {
    return apiClient<RetrospectiveDto>(`/api/sprints/${sprintId}/retrospective`);
  },

  createRetroItem(sprintId: string, body: CreateRetroItemRequest): Promise<RetroItemDto> {
    return apiClient<RetroItemDto>(`/api/sprints/${sprintId}/retrospective/items`, {
      method: "POST",
      body,
    });
  },

  voteRetroItem(sprintId: string, itemId: string): Promise<RetroItemDto> {
    return apiClient<RetroItemDto>(
      `/api/sprints/${sprintId}/retrospective/items/${itemId}/vote`,
      { method: "POST" }
    );
  },

  postRetroComment(sprintId: string, body: CreateRetroCommentRequest) {
    return apiClient(`/api/sprints/${sprintId}/retrospective/comments`, {
      method: "POST",
      body,
    });
  },

  getReview(sprintId: string): Promise<SprintReviewDto> {
    return apiClient<SprintReviewDto>(`/api/sprints/${sprintId}/review`);
  },

  updateReview(sprintId: string, body: UpdateReviewRequest): Promise<SprintReviewDto> {
    return apiClient<SprintReviewDto>(`/api/sprints/${sprintId}/review`, {
      method: "PUT",
      body,
    });
  },

  getCapacity(sprintId: string): Promise<SprintCapacityDto> {
    return apiClient<SprintCapacityDto>(`/api/sprints/${sprintId}/capacity`);
  },

  updateCapacity(sprintId: string, body: UpdateCapacityRequest): Promise<SprintCapacityDto> {
    return apiClient<SprintCapacityDto>(`/api/sprints/${sprintId}/capacity`, {
      method: "PUT",
      body,
    });
  },

  reorderBacklog(body: ReorderBacklogRequest): Promise<BacklogItemDto[]> {
    return apiClient<BacklogItemDto[]>("/api/sprints/backlog/reorder", {
      method: "POST",
      body,
    });
  },
};
