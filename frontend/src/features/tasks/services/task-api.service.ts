/**
 * Live HTTP adapter for task UI types.
 * Transport: `taskApi` → Gateway → task-service.
 */

import { ApiError, isApiError, projectApi, taskApi } from "@/lib/api";
import { resolveLiveApiFlag } from "@/lib/api/live-api";
import { useAuthStore } from "@/features/auth";

import { BOARD_COLUMNS, STATUS_LABELS } from "../constants/task.constants";
import type {
  BulkTaskUpdate,
  CreateTaskPayload,
  Task,
  TaskBoardColumn,
  TaskChecklistItem,
  TaskDetail,
  TaskFilters,
  TaskListResult,
  TaskSortField,
  TaskStatus,
  UpdateTaskPayload,
} from "../types/task.types";
import {
  TaskNotFoundError,
  TaskPermissionError,
  TaskValidationError,
} from "../utils/errors";
import {
  dtoToTask,
  dtoToTaskDetail,
  filtersToQuery,
  isUuid,
  labelDtosFromNames,
} from "./task-api.mappers";

function mapError(error: unknown): never {
  if (isApiError(error)) {
    if (error.status === 401 || error.status === 403) {
      throw new TaskPermissionError(error.message || "You do not have permission");
    }
    if (error.status === 404) {
      throw new TaskNotFoundError(error.message || "Task not found");
    }
    if (error.status === 400 || error.status === 409 || error.status === 422) {
      throw new TaskValidationError(error.message || "Validation failed");
    }
  }
  if (error instanceof ApiError) {
    throw new TaskValidationError(error.message);
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

function currentUser() {
  return useAuthStore.getState().user;
}

function matchesClientFilters(task: Task, filters: TaskFilters): boolean {
  if (filters.myTasks) {
    const me = currentUser()?.id;
    if (!me || task.assignee?.id !== me) return false;
  }
  if (filters.hasAttachments && task.attachmentCount === 0) return false;
  if (filters.hasComments && task.commentCount === 0) return false;
  if (filters.label) {
    const needle = filters.label.toLowerCase();
    if (
      !task.labels.some(
        (label) =>
          label.name.toLowerCase() === needle || label.id.toLowerCase() === needle
      )
    ) {
      return false;
    }
  }
  if (filters.overdue) {
    if (!task.dueDate) return false;
    if (task.status === "done" || task.archived) return false;
    if (new Date(task.dueDate).getTime() >= Date.now()) return false;
  }
  return true;
}

async function resolveProjectMeta(projectId: string): Promise<{
  projectKey: string;
  projectName: string;
  organizationId?: string;
}> {
  if (!isUuid(projectId)) {
    throw new TaskValidationError("Select a valid project");
  }
  const project = await call(() => projectApi.getProjectSummary(projectId));
  return {
    projectKey: project.key,
    projectName: project.name,
    organizationId: project.organizationId,
  };
}

export const taskApiService = {
  async list(params: {
    filters?: Partial<TaskFilters>;
    sort?: TaskSortField;
  } = {}): Promise<TaskListResult> {
    const query = filtersToQuery(params.filters, params.sort);
    const page = await call(() => taskApi.getTasks(query));
    const merged: TaskFilters = {
      q: "",
      status: "all",
      priority: "all",
      assigneeId: null,
      reporterId: null,
      sprintId: null,
      projectId: null,
      label: null,
      myTasks: false,
      overdue: false,
      hasAttachments: false,
      hasComments: false,
      archived: false,
      ...params.filters,
    };
    const items = page.items
      .map(dtoToTask)
      .filter((task) => matchesClientFilters(task, merged));
    return { items, total: items.length };
  },

  async getById(id: string): Promise<TaskDetail> {
    const dto = await call(() => taskApi.getTaskDetail(id));
    return dtoToTaskDetail(dto);
  },

  async board(projectId?: string | null): Promise<TaskBoardColumn[]> {
    const page = await call(() =>
      taskApi.getTasks({
        projectId: projectId || undefined,
        archived: false,
        page: 0,
        size: 100,
        sort: "updated",
      })
    );
    const tasks = page.items.map(dtoToTask);
    return BOARD_COLUMNS.map((status) => ({
      status,
      label: STATUS_LABELS[status],
      tasks: tasks.filter((task) =>
        status === "archived"
          ? task.archived || task.status === "archived"
          : task.status === status && !task.archived
      ),
    }));
  },

  async create(payload: CreateTaskPayload): Promise<TaskDetail> {
    if (!payload.title?.trim()) throw new TaskValidationError("Title is required");
    if (!payload.projectId) throw new TaskValidationError("Project is required");

    const project = await resolveProjectMeta(payload.projectId);
    const me = currentUser();
    const reporterId =
      (isUuid(payload.reporterId) ? payload.reporterId : undefined) ?? me?.id;
    const assigneeId = isUuid(payload.assigneeId) ? payload.assigneeId : undefined;

    const dto = await call(() =>
      taskApi.createTask({
        title: payload.title.trim(),
        description: payload.description ?? null,
        projectId: payload.projectId,
        projectKey: project.projectKey,
        projectName: project.projectName,
        organizationId: project.organizationId ?? null,
        sprintId: isUuid(payload.sprintId) ? payload.sprintId : null,
        sprintName: null,
        status: payload.status,
        priority: payload.priority,
        assigneeId: assigneeId ?? null,
        assigneeName: null,
        assigneeEmail: null,
        reporterId: reporterId ?? null,
        reporterName: me?.name ?? null,
        reporterEmail: me?.email ?? null,
        labels: labelDtosFromNames(payload.labels ?? []),
        storyPoints: payload.storyPoints ?? null,
        estimateMinutes: payload.estimateMinutes ?? null,
        dueDate: payload.dueDate || null,
        startDate: payload.startDate || null,
        parentId: isUuid(payload.parentId) ? payload.parentId : null,
        checklist: payload.checklist ?? [],
      })
    );
    return this.getById(dto.id);
  },

  async update(id: string, payload: UpdateTaskPayload): Promise<TaskDetail> {
    const body: Parameters<typeof taskApi.updateTask>[1] = {};

    if (payload.title !== undefined) body.title = payload.title.trim();
    if (payload.description !== undefined) body.description = payload.description ?? "";
    if (payload.status !== undefined) body.status = payload.status;
    if (payload.priority !== undefined) body.priority = payload.priority;
    if (payload.storyPoints !== undefined) body.storyPoints = payload.storyPoints;
    if (payload.estimateMinutes !== undefined) {
      body.estimateMinutes = payload.estimateMinutes;
    }
    if (payload.dueDate !== undefined) body.dueDate = payload.dueDate || null;
    if (payload.startDate !== undefined) body.startDate = payload.startDate || null;
    if (payload.favorite !== undefined) body.favorite = payload.favorite;
    if (payload.watching !== undefined) body.watching = payload.watching;
    if (payload.archived !== undefined) body.archived = payload.archived;
    if (payload.labels !== undefined) body.labels = labelDtosFromNames(payload.labels);

    if (payload.projectId !== undefined) {
      if (!isUuid(payload.projectId)) {
        throw new TaskValidationError("Select a valid project");
      }
      const project = await resolveProjectMeta(payload.projectId);
      body.projectId = payload.projectId;
      body.projectKey = project.projectKey;
      body.projectName = project.projectName;
      body.organizationId = project.organizationId ?? null;
    }

    if (payload.sprintId !== undefined) {
      body.sprintId = isUuid(payload.sprintId) ? payload.sprintId : null;
      body.sprintName = null;
    }

    if (payload.assigneeId !== undefined) {
      if (payload.assigneeId === "" || payload.assigneeId == null) {
        body.assigneeId = null;
        body.assigneeName = "";
        body.assigneeEmail = "";
      } else if (isUuid(payload.assigneeId)) {
        body.assigneeId = payload.assigneeId;
      }
    }

    if (payload.reporterId !== undefined && isUuid(payload.reporterId)) {
      body.reporterId = payload.reporterId;
    }

    if (payload.parentId !== undefined) {
      body.parentId = isUuid(payload.parentId) ? payload.parentId : null;
    }

    const dto = await call(() => taskApi.updateTask(id, body));
    return this.getById(dto.id);
  },

  async move(id: string, status: TaskStatus): Promise<TaskDetail> {
    return this.update(id, { status, archived: status === "archived" });
  },

  async duplicate(id: string): Promise<TaskDetail> {
    const source = await this.getById(id);
    return this.create({
      title: `${source.title} (Copy)`,
      description: source.description,
      projectId: source.projectId,
      sprintId: source.sprintId,
      status: "todo",
      priority: source.priority,
      assigneeId: source.assignee?.id,
      reporterId: source.reporter.id,
      labels: source.labels.map((label) => label.name),
      storyPoints: source.storyPoints,
      estimateMinutes: source.estimateMinutes,
      dueDate: source.dueDate,
      checklist: source.checklist.map((item) => item.title),
    });
  },

  async delete(id: string): Promise<void> {
    await call(() => taskApi.deleteTask(id));
  },

  async bulkUpdate(payload: BulkTaskUpdate): Promise<Task[]> {
    const updated: Task[] = [];
    for (const id of payload.taskIds) {
      const detail = await this.update(id, {
        assigneeId: payload.assigneeId === null ? "" : payload.assigneeId,
        status: payload.status,
        priority: payload.priority,
        sprintId: payload.sprintId === null ? "" : payload.sprintId,
        archived: payload.archived,
      });
      updated.push(detail);
    }
    return updated;
  },

  async toggleFavorite(id: string): Promise<TaskDetail> {
    const task = await this.getById(id);
    return this.update(id, { favorite: !task.favorite });
  },

  async toggleWatch(id: string): Promise<TaskDetail> {
    const task = await this.getById(id);
    return this.update(id, { watching: !task.watching });
  },

  async updateChecklist(
    taskId: string,
    checklist: TaskChecklistItem[]
  ): Promise<TaskDetail> {
    await call(() =>
      taskApi.replaceChecklist(
        taskId,
        checklist.map((item) => ({
          id: isUuid(item.id) ? item.id : null,
          title: item.title,
          completed: item.completed,
        }))
      )
    );
    return this.getById(taskId);
  },

  async createRelation(
    taskId: string,
    input: { type: string; targetTaskId: string }
  ): Promise<TaskDetail> {
    if (!isUuid(input.targetTaskId)) {
      throw new TaskValidationError("Select a valid linked task");
    }
    await call(() =>
      taskApi.createRelation(taskId, {
        type: input.type,
        targetTaskId: input.targetTaskId,
      })
    );
    return this.getById(taskId);
  },

  async deleteRelation(taskId: string, relationId: string): Promise<TaskDetail> {
    await call(() => taskApi.deleteRelation(taskId, relationId));
    return this.getById(taskId);
  },

  async logTime(
    taskId: string,
    input: { minutes: number; note?: string }
  ): Promise<TaskDetail> {
    if (!Number.isFinite(input.minutes) || input.minutes < 1) {
      throw new TaskValidationError("Enter minutes greater than 0");
    }
    await call(() =>
      taskApi.logTime(taskId, {
        minutes: Math.round(input.minutes),
        note: input.note ?? null,
      })
    );
    return this.getById(taskId);
  },
};

/** Live task API when flag allows and Gateway + Keycloak are configured. */
export function isTaskApiEnabled(): boolean {
  return resolveLiveApiFlag(process.env.NEXT_PUBLIC_USE_TASK_API);
}
