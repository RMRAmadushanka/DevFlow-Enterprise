import type { Id } from "@/types/common";

/**
 * Domain DTO placeholders for the feature module template.
 * Copy this folder to `features/<name>/` and rename Entity → domain.
 */

export interface Entity {
  id: Id;
  name: string;
  status: "active" | "archived";
  createdAt: string;
  updatedAt: string;
}

export interface EntityListParams {
  page: number;
  pageSize: number;
  search?: string;
  status?: Entity["status"];
  sort?: "name" | "createdAt" | "updatedAt";
  direction?: "asc" | "desc";
}

export type CreateEntityInput = Pick<Entity, "name" | "status">;
export type UpdateEntityInput = Partial<CreateEntityInput>;
