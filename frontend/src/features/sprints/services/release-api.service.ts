/**
 * Live HTTP adapter for release UI types.
 * Transport: `releaseApi` → Gateway → sprint-service (`/api/releases`).
 */

import { ApiError, isApiError, projectApi, releaseApi } from "@/lib/api";

import type { CreateReleasePayload, Release, UpdateReleasePayload } from "../types/sprint.types";
import { SprintNotFoundError, SprintValidationError } from "../utils/errors";
import { createPayloadToRequest, dtoToRelease, updatePayloadToRequest } from "./release-api.mappers";

function mapError(error: unknown): never {
  if (isApiError(error)) {
    if (error.status === 404) {
      throw new SprintNotFoundError(error.message || "Release not found");
    }
    if (error.status === 400 || error.status === 409 || error.status === 422) {
      throw new SprintValidationError(error.message || "Validation failed");
    }
    throw new SprintValidationError(error.message || "Request failed");
  }
  if (error instanceof ApiError) {
    throw new SprintValidationError(error.message);
  }
  throw error;
}

async function call<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    mapError(error);
  }
}

/** Release DTOs don't carry a denormalized project name — resolve it best-effort, once per unique project. */
async function resolveProjectNames(projectIds: string[]): Promise<Map<string, string>> {
  const unique = Array.from(new Set(projectIds));
  const names = new Map<string, string>();
  await Promise.all(
    unique.map(async (id) => {
      try {
        const project = await projectApi.getProjectSummary(id);
        names.set(id, project.name);
      } catch (error) {
        console.error("Failed to resolve project name for release", error);
        names.set(id, "Unknown project");
      }
    })
  );
  return names;
}

export const releaseApiService = {
  async list(projectId?: string | null): Promise<Release[]> {
    const dtos = await call(() => releaseApi.getReleases({ projectId: projectId ?? undefined }));
    const names = await resolveProjectNames(dtos.map((dto) => dto.projectId));
    return dtos.map((dto) => dtoToRelease(dto, names.get(dto.projectId)));
  },

  async getById(id: string): Promise<Release | undefined> {
    const dto = await call(() => releaseApi.getRelease(id));
    const names = await resolveProjectNames([dto.projectId]);
    return dtoToRelease(dto, names.get(dto.projectId));
  },

  async create(payload: CreateReleasePayload): Promise<Release> {
    if (!payload.name?.trim()) throw new SprintValidationError("Release name is required");
    if (!payload.projectId) throw new SprintValidationError("Project is required");
    const dto = await call(() => releaseApi.createRelease(createPayloadToRequest(payload)));
    const names = await resolveProjectNames([dto.projectId]);
    return dtoToRelease(dto, names.get(dto.projectId));
  },

  async update(id: string, payload: UpdateReleasePayload): Promise<Release> {
    const dto = await call(() => releaseApi.updateRelease(id, updatePayloadToRequest(payload)));
    const names = await resolveProjectNames([dto.projectId]);
    return dtoToRelease(dto, names.get(dto.projectId));
  },

  async delete(id: string): Promise<void> {
    await call(() => releaseApi.deleteRelease(id));
  },
};
