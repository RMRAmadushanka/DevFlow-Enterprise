import { apiClient } from "@/lib/api";
import type { PaginatedResult } from "@/types/common";
import type {
  CreateEntityInput,
  Entity,
  EntityListParams,
  UpdateEntityInput,
} from "../types/entity.types";

/**
 * Service layer — API communication only.
 * No UI, toasts, or React Query. Hooks call these functions.
 *
 * Endpoints are architectural placeholders; replace paths when the API exists.
 */
export const entityService = {
  list(params: EntityListParams): Promise<PaginatedResult<Entity>> {
    const { page, pageSize, search, status, sort, direction } = params;
    return apiClient<PaginatedResult<Entity>>("/api/entities", {
      query: { page, pageSize, search, status, sort, direction },
    });
  },

  getById(id: string): Promise<Entity> {
    return apiClient<Entity>(`/api/entities/${id}`);
  },

  create(input: CreateEntityInput): Promise<Entity> {
    return apiClient<Entity>("/api/entities", { method: "POST", body: input });
  },

  update(id: string, input: UpdateEntityInput): Promise<Entity> {
    return apiClient<Entity>(`/api/entities/${id}`, { method: "PATCH", body: input });
  },

  remove(id: string): Promise<void> {
    return apiClient<void>(`/api/entities/${id}`, { method: "DELETE" });
  },
};
