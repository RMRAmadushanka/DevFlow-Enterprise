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
  SprintSortField,
  UpdateSprintPayload,
} from "../types/sprint.types";
import {
  SprintNotFoundError,
  SprintValidationError,
} from "../utils/errors";
import {
  dtoToSprint,
  dtoToSprintDetail,
  filtersToQuery,
  isUuid,
} from "./sprint-api.mappers";

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
    return dtoToSprintDetail(dto);
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
      })
    );
    return dtoToSprintDetail(dto);
  },

  async start(id: string): Promise<SprintDetail> {
    return this.update(id, { status: "active" });
  },

  async complete(id: string): Promise<SprintDetail> {
    return this.update(id, { status: "completed" });
  },

  async archive(id: string): Promise<SprintDetail> {
    return this.update(id, { archived: true, status: "archived" });
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

  async planning(_sprintId: string): Promise<PlanningState> {
    return {
      backlog: [],
      sprintTasks: [],
      capacityPoints: 0,
      allocatedPoints: 0,
    };
  },

  async moveTasksToSprint(sprintId: string, _taskIds: string[]): Promise<PlanningState> {
    return this.planning(sprintId);
  },

  velocityHistory(): Array<{ label: string; committed: number; completed: number }> {
    return [];
  },
};
