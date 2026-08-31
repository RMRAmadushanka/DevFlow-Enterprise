import { apiClient } from "../client";
import type {
  CreateSprintRequest,
  SprintDto,
  SprintListQuery,
  SprintPage,
  UpdateSprintRequest,
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
};
