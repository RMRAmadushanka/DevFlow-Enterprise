/**
 * Live HTTP adapter for sprint UI types.
 * Transport: `sprintApi` → Gateway → sprint-service.
 */

import { ApiError, isApiError, projectApi, sprintApi } from "@/lib/api";
import { resolveLiveApiFlag } from "@/lib/api/live-api";

import type {
  CreateSprintPayload,
  PlanningState,
  SprintDetail,
  SprintFilters,
  SprintListResult,
  SprintMemberCapacity,
  SprintReview,
  SprintRetrospective,
  SprintSortField,
  UpdateSprintPayload,
  VelocityPoint,
} from "../types/sprint.types";
import {
  SprintNotFoundError,
  SprintValidationError,
} from "../utils/errors";
import {
  dtoToCapacity,
  dtoToPlanningState,
  dtoToRetrospective,
  dtoToSprint,
  dtoToSprintActivity,
  dtoToSprintDetail,
  dtoToSprintReview,
  dtoToVelocityPoint,
  filtersToQuery,
  isUuid,
  type SprintDetailExtras,
} from "./sprint-api.mappers";
import type { RetroColumnType } from "@/lib/api/types/sprint";

function mapError(error: unknown): never {
  if (isApiError(error)) {
    if (error.status === 404) {
      throw new SprintNotFoundError(error.message || "Sprint not found");
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

async function resolveProjectMeta(projectId: string): Promise<{
  projectName: string;
  organizationId?: string;
}> {
  if (!isUuid(projectId)) {
    throw new SprintValidationError("Select a valid project");
  }
  const project = await call(() => projectApi.getProjectSummary(projectId));
  return {
    projectName: project.name,
    organizationId: project.organizationId,
  };
}

export function isSprintApiEnabled(): boolean {
  return resolveLiveApiFlag(process.env.NEXT_PUBLIC_USE_SPRINT_API);
}

export const sprintApiService = {
  async list(params: {
    filters?: Partial<SprintFilters>;
    sort?: SprintSortField;
  } = {}): Promise<SprintListResult> {
    const query = filtersToQuery(params.filters, params.sort);
    const page = await call(() => sprintApi.getSprints(query));
    const items = page.items.map(dtoToSprint);
    return {
      items,
      total: page.totalElements ?? items.length,
      current: items.find((s) => s.status === "active") ?? null,
      upcoming: items.filter((s) => s.status === "planning"),
      completed: items.filter((s) => s.status === "completed"),
      archived: items.filter((s) => s.status === "archived" || s.archived),
    };
  },

  async getById(id: string): Promise<SprintDetail> {
    const dto = await call(() => sprintApi.getSprint(id));
    // Burndown/retrospective/review/capacity are secondary data sources — don't let
    // any one of them fail the whole sprint load.
    const [burndown, retrospective, review, capacity] = await Promise.all([
      sprintApi.getBurndown(id).catch((error) => {
        console.error("Failed to load sprint burndown", error);
        return [];
      }),
      sprintApi.getRetrospective(id).catch((error) => {
        console.error("Failed to load sprint retrospective", error);
        return undefined;
      }),
      sprintApi.getReview(id).catch((error) => {
        console.error("Failed to load sprint review", error);
        return undefined;
      }),
      sprintApi.getCapacity(id).catch((error) => {
        console.error("Failed to load sprint capacity", error);
        return undefined;
      }),
    ]);
    const extras: SprintDetailExtras = { retrospective, review, capacity };
    return dtoToSprintDetail(dto, burndown, extras);
  },

  async create(payload: CreateSprintPayload): Promise<SprintDetail> {
    if (!payload.name?.trim()) throw new SprintValidationError("Sprint name is required");
    if (!payload.projectId) throw new SprintValidationError("Project is required");
    if (payload.startDate > payload.endDate) {
      throw new SprintValidationError("End date must be after start date");
    }

    const project = await resolveProjectMeta(payload.projectId);
    const dto = await call(() =>
      sprintApi.createSprint({
        name: payload.name.trim(),
        goal: payload.goal || null,
        description: payload.description ?? null,
        projectId: payload.projectId,
        projectName: project.projectName,
        organizationId: project.organizationId ?? null,
        startDate: payload.startDate,
        endDate: payload.endDate,
        capacityPoints: payload.capacityPoints,
        storyPointGoal: payload.storyPointGoal,
        releaseId: payload.releaseId ?? null,
      })
    );
    return dtoToSprintDetail(dto);
  },

  async update(id: string, payload: UpdateSprintPayload): Promise<SprintDetail> {
    let projectName: string | undefined;
    let organizationId: string | undefined;
    if (payload.projectId) {
      const project = await resolveProjectMeta(payload.projectId);
      projectName = project.projectName;
      organizationId = project.organizationId;
    }

    const dto = await call(() =>
      sprintApi.updateSprint(id, {
        name: payload.name,
        goal: payload.goal,
        description: payload.description,
        projectId: payload.projectId,
        projectName,
        organizationId,
        startDate: payload.startDate,
        endDate: payload.endDate,
        capacityPoints: payload.capacityPoints,
        storyPointGoal: payload.storyPointGoal,
        status: payload.status,
        archived: payload.archived,
        releaseId: payload.releaseId,
      })
    );
    return dtoToSprintDetail(dto);
  },

  async start(id: string): Promise<SprintDetail> {
    const dto = await call(() => sprintApi.startSprint(id));
    return dtoToSprintDetail(dto);
  },

  async complete(id: string, moveIncompleteToBacklog?: boolean): Promise<SprintDetail> {
    const dto = await call(() =>
      sprintApi.completeSprint(
        id,
        moveIncompleteToBacklog === undefined ? undefined : { moveIncompleteToBacklog }
      )
    );
    return dtoToSprintDetail(dto);
  },

  async archive(id: string): Promise<SprintDetail> {
    const dto = await call(() => sprintApi.archiveSprint(id));
    return dtoToSprintDetail(dto);
  },

  async delete(id: string): Promise<void> {
    await call(() => sprintApi.deleteSprint(id));
  },

  async duplicate(id: string): Promise<SprintDetail> {
    const current = await this.getById(id);
    return this.create({
      name: `${current.name} (copy)`,
      goal: current.goal,
      description: current.description,
      projectId: current.projectId,
      startDate: current.startDate,
      endDate: current.endDate,
      capacityPoints: current.capacityPoints,
      storyPointGoal: current.storyPointGoal,
    });
  },

  async planning(sprintId: string): Promise<PlanningState> {
    const dto = await call(() => sprintApi.getPlanning(sprintId));
    return dtoToPlanningState(dto);
  },

  async moveTasksToSprint(sprintId: string, taskIds: string[]): Promise<PlanningState> {
    // The move-tasks endpoint requires the owning projectId, which isn't available
    // at existing call sites — resolve it from the sprint itself.
    const sprint = await call(() => sprintApi.getSprint(sprintId));
    const dto = await call(() =>
      sprintApi.moveTasksToSprint(sprintId, taskIds, sprint.projectId)
    );
    return dtoToPlanningState(dto);
  },

  async velocityHistory(projectId: string): Promise<VelocityPoint[]> {
    const points = await call(() => sprintApi.getVelocityHistory(projectId));
    return points.map(dtoToVelocityPoint);
  },

  async activity(sprintId: string): Promise<SprintDetail["activity"]> {
    const items = await call(() => sprintApi.getActivity(sprintId));
    return items.map(dtoToSprintActivity);
  },

  async getRetrospective(sprintId: string): Promise<SprintRetrospective> {
    const dto = await call(() => sprintApi.getRetrospective(sprintId));
    return dtoToRetrospective(dto);
  },

  async createRetroItem(
    sprintId: string,
    input: { columnType: RetroColumnType; text: string }
  ): Promise<SprintRetrospective> {
    if (!input.text?.trim()) {
      throw new SprintValidationError("Retro item text is required");
    }
    await call(() => sprintApi.createRetroItem(sprintId, input));
    return this.getRetrospective(sprintId);
  },

  async voteRetroItem(sprintId: string, itemId: string): Promise<SprintRetrospective> {
    await call(() => sprintApi.voteRetroItem(sprintId, itemId));
    return this.getRetrospective(sprintId);
  },

  async postRetroComment(sprintId: string, text: string): Promise<SprintRetrospective> {
    if (!text?.trim()) {
      throw new SprintValidationError("Comment text is required");
    }
    await call(() => sprintApi.postRetroComment(sprintId, { text }));
    return this.getRetrospective(sprintId);
  },

  async getReview(sprintId: string): Promise<SprintReview> {
    const dto = await call(() => sprintApi.getReview(sprintId));
    return dtoToSprintReview(dto);
  },

  async updateReview(
    sprintId: string,
    payload: { deploymentSummary?: string; teamPerformance?: string }
  ): Promise<SprintReview> {
    const dto = await call(() => sprintApi.updateReview(sprintId, payload));
    return dtoToSprintReview(dto);
  },

  async getCapacity(sprintId: string): Promise<SprintMemberCapacity[]> {
    const dto = await call(() => sprintApi.getCapacity(sprintId));
    return dtoToCapacity(dto);
  },

  async updateCapacity(
    sprintId: string,
    members: Array<{ userId: string; userName: string; capacityPoints: number }>
  ): Promise<SprintMemberCapacity[]> {
    const dto = await call(() => sprintApi.updateCapacity(sprintId, { members }));
    return dtoToCapacity(dto);
  },
};
