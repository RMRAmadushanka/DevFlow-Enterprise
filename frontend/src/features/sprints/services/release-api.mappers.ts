import type {
  CreateReleasePayload,
  Release,
  ReleaseStatus,
  UpdateReleasePayload,
} from "../types/sprint.types";
import type { CreateReleaseRequest, ReleaseDto, UpdateReleaseRequest } from "@/lib/api/types/release";

const STATUS_SET = new Set<string>(["planned", "in_progress", "released", "delayed"]);

export function toUiReleaseStatus(raw: string | null | undefined): ReleaseStatus {
  const value = (raw ?? "planned").toLowerCase();
  return STATUS_SET.has(value) ? (value as ReleaseStatus) : "planned";
}

export function toApiReleaseStatus(status: ReleaseStatus): string {
  return status.toUpperCase();
}

export function dtoToRelease(dto: ReleaseDto, projectName = "Unknown project"): Release {
  return {
    id: dto.id,
    name: dto.name,
    version: dto.version ?? "",
    projectId: dto.projectId,
    projectName,
    releaseDate: dto.releaseDate ?? "",
    status: toUiReleaseStatus(dto.status),
    // sprint-service's release DTO doesn't include linked sprint ids yet.
    sprintIds: [],
    featureNames: dto.features ?? [],
    description: dto.description ?? "",
  };
}

export function createPayloadToRequest(payload: CreateReleasePayload): CreateReleaseRequest {
  return {
    projectId: payload.projectId,
    name: payload.name.trim(),
    version: payload.version?.trim() || null,
    description: payload.description?.trim() || null,
    status: toApiReleaseStatus(payload.status),
    releaseDate: payload.releaseDate || null,
    features: payload.features,
  };
}

export function updatePayloadToRequest(payload: UpdateReleasePayload): UpdateReleaseRequest {
  return {
    name: payload.name?.trim(),
    version: payload.version?.trim() || undefined,
    description: payload.description?.trim() || undefined,
    status: payload.status ? toApiReleaseStatus(payload.status) : undefined,
    releaseDate: payload.releaseDate || undefined,
    features: payload.features,
  };
}
