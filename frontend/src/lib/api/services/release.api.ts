import { apiClient } from "../client";
import type {
  CreateReleaseRequest,
  ReleaseDto,
  ReleaseListQuery,
  UpdateReleaseRequest,
} from "../types/release";

/** Typed Gateway client for sprint-service's release endpoints (`/api/releases`). */
export const releaseApi = {
  getReleases(query?: ReleaseListQuery): Promise<ReleaseDto[]> {
    return apiClient<ReleaseDto[]>("/api/releases", {
      query: { projectId: query?.projectId },
    });
  },

  getRelease(id: string): Promise<ReleaseDto> {
    return apiClient<ReleaseDto>(`/api/releases/${id}`);
  },

  createRelease(body: CreateReleaseRequest): Promise<ReleaseDto> {
    return apiClient<ReleaseDto>("/api/releases", { method: "POST", body });
  },

  updateRelease(id: string, body: UpdateReleaseRequest): Promise<ReleaseDto> {
    return apiClient<ReleaseDto>(`/api/releases/${id}`, { method: "PATCH", body });
  },

  deleteRelease(id: string): Promise<void> {
    return apiClient<void>(`/api/releases/${id}`, { method: "DELETE" });
  },
};
