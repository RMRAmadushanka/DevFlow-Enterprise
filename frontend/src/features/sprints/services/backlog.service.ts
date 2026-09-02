import { ApiError, isApiError, sprintApi } from "@/lib/api";

import type { BacklogItem } from "../types/sprint.types";
import { SprintValidationError } from "../utils/errors";
import { dtoToBacklogItem } from "./sprint-api.mappers";
import { isSprintApiEnabled } from "./sprint-api.service";
import { sprintService } from "./sprint.service";

const delay = (ms = 250) => new Promise((resolve) => setTimeout(resolve, ms));

let backlogSeed: BacklogItem[] = [
  {
    id: "task_3",
    key: "MOB-42",
    title: "Offline cache for project list",
    priority: "medium",
    status: "todo",
    storyPoints: 8,
    epicName: "Mobile reliability",
    sprintId: null,
    assigneeName: "Riley Kim",
    projectId: "proj_mobile",
  },
  {
    id: "task_5",
    key: "DOCS-12",
    title: "Document deployment checklist",
    priority: "low",
    status: "backlog",
    storyPoints: 1,
    epicName: "Docs",
    sprintId: null,
    projectId: "proj_docs",
  },
  {
    id: "task_7",
    key: "WEB-91",
    title: "Calendar view foundation",
    priority: "medium",
    status: "blocked",
    storyPoints: 5,
    epicName: "Scheduling",
    sprintId: null,
    assigneeName: "Avery Chen",
    projectId: "proj_web",
  },
  {
    id: "task_9",
    key: "API-110",
    title: "Add request tracing headers",
    priority: "high",
    status: "backlog",
    storyPoints: 3,
    epicName: "Observability",
    sprintId: null,
    projectId: "proj_api",
  },
  {
    id: "task_10",
    key: "WEB-95",
    title: "Keyboard shortcuts for board",
    priority: "low",
    status: "backlog",
    storyPoints: 2,
    epicName: "A11y",
    sprintId: null,
    projectId: "proj_web",
  },
];

function mapError(error: unknown): never {
  if (isApiError(error)) {
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

/** Live HTTP adapter — backed by sprint-service's `/api/sprints/backlog` endpoints. */
const backlogApiService = {
  async list(projectId: string, q = ""): Promise<BacklogItem[]> {
    const dtos = await call(() => sprintApi.getBacklog(projectId));
    const items = dtos.map(dtoToBacklogItem);
    const query = q.trim().toLowerCase();
    if (!query) return items;
    return items.filter((item) =>
      [item.key, item.title, item.epicName ?? ""].join(" ").toLowerCase().includes(query)
    );
  },

  async moveToSprint(
    projectId: string,
    sprintId: string,
    taskIds: string[]
  ): Promise<BacklogItem[]> {
    await call(() => sprintApi.moveTasksToSprint(sprintId, taskIds, projectId));
    return this.list(projectId);
  },

  async reorder(projectId: string, orderedIds: string[]): Promise<BacklogItem[]> {
    // The reorder endpoint returns the full re-fetched ordered backlog — use it
    // directly instead of issuing a second GET.
    const dtos = await call(() =>
      sprintApi.reorderBacklog({ projectId, orderedTaskIds: orderedIds })
    );
    return dtos.map(dtoToBacklogItem);
  },
};

export function isBacklogApiEnabled(): boolean {
  return isSprintApiEnabled();
}

const mockBacklogService = {
  async list(projectId: string, q = ""): Promise<BacklogItem[]> {
    await delay();
    const query = q.trim().toLowerCase();
    return backlogSeed
      .filter((item) => item.projectId === projectId && !item.sprintId)
      .filter((item) => {
        if (!query) return true;
        return [item.key, item.title, item.epicName ?? ""]
          .join(" ")
          .toLowerCase()
          .includes(query);
      })
      .sort((a, b) => (b.storyPoints ?? 0) - (a.storyPoints ?? 0));
  },

  async moveToSprint(projectId: string, sprintId: string, taskIds: string[]) {
    await delay(300);
    const moving = backlogSeed.filter(
      (item) => item.projectId === projectId && taskIds.includes(item.id)
    );
    backlogSeed = backlogSeed.map((item) =>
      taskIds.includes(item.id) ? { ...item, sprintId } : item
    );
    await sprintService.moveTasksToSprint(
      sprintId,
      moving.map((item) => item.id)
    );
    return this.list(projectId);
  },

  async reorder(projectId: string, orderedIds: string[]): Promise<BacklogItem[]> {
    await delay(150);
    const map = new Map(backlogSeed.map((item) => [item.id, item]));
    const reordered = orderedIds
      .map((id) => map.get(id))
      .filter((item): item is BacklogItem => Boolean(item));
    const others = backlogSeed.filter(
      (item) => item.projectId !== projectId || !orderedIds.includes(item.id)
    );
    backlogSeed = [...reordered, ...others];
    return this.list(projectId);
  },
};

export const backlogService = new Proxy(mockBacklogService, {
  get(target, prop, receiver) {
    if (isBacklogApiEnabled()) {
      const live = Reflect.get(backlogApiService, prop, backlogApiService);
      if (typeof live === "function") {
        return (live as (...args: unknown[]) => unknown).bind(backlogApiService);
      }
    }
    const value = Reflect.get(target, prop, receiver);
    return typeof value === "function" ? value.bind(target) : value;
  },
});
