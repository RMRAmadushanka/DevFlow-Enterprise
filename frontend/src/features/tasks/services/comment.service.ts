import { isLiveBackendMode } from "@/lib/api/live-api";
import { useAuthStore } from "@/features/auth";
import { ApiError, isApiError, taskApi } from "@/lib/api";

import type {
  CreateCommentPayload,
  TaskComment,
  UpdateCommentPayload,
} from "../types/comment.types";
import {
  TaskNotFoundError,
  TaskPermissionError,
  TaskValidationError,
} from "../utils/errors";
import { dtoToComment } from "./task-api.mappers";
import { isTaskApiEnabled } from "./task-api.service";
import { taskService } from "./task.service";

const delay = (ms = 220) => new Promise((resolve) => setTimeout(resolve, ms));

const commentsByTask = new Map<string, TaskComment[]>();
let commentSeq = 1;

function seedIfNeeded(taskId: string) {
  if (commentsByTask.has(taskId)) return;
  if (isLiveBackendMode()) {
    commentsByTask.set(taskId, []);
    return;
  }
  commentsByTask.set(taskId, [
    {
      id: `cmt_${taskId}_1`,
      taskId,
      authorId: "1",
      authorName: "Avery Chen",
      bodyHtml: "<p>Looks good — please add test coverage for the edge case.</p>",
      createdAt: "2026-08-04T11:00:00.000Z",
      updatedAt: "2026-08-04T11:00:00.000Z",
      edited: false,
    },
  ]);
}

function currentAuthor(): { id: string; name: string; avatarUrl?: string } {
  const user = useAuthStore.getState().user;
  if (user) {
    return {
      id: user.id,
      name: user.name,
      avatarUrl: user.avatarUrl,
    };
  }
  return { id: "1", name: "Avery Chen" };
}

function mapError(error: unknown): never {
  if (isApiError(error)) {
    if (error.status === 401 || error.status === 403) {
      throw new TaskPermissionError(error.message || "You do not have permission");
    }
    if (error.status === 404) {
      throw new TaskNotFoundError(error.message || "Comment not found");
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

const liveCommentService = {
  async list(taskId: string): Promise<TaskComment[]> {
    const items = await call(() => taskApi.listComments(taskId));
    return items.map(dtoToComment).sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  },

  async create(payload: CreateCommentPayload): Promise<TaskComment> {
    const text = payload.bodyHtml.replace(/<[^>]*>/g, "").trim();
    if (!text) throw new TaskValidationError("Comment cannot be empty");
    const dto = await call(() =>
      taskApi.createComment(payload.taskId, {
        bodyHtml: payload.bodyHtml,
        parentId: payload.parentId ?? null,
      })
    );
    return dtoToComment(dto);
  },

  async update(id: string, taskId: string, payload: UpdateCommentPayload): Promise<TaskComment> {
    const text = payload.bodyHtml.replace(/<[^>]*>/g, "").trim();
    if (!text) throw new TaskValidationError("Comment cannot be empty");
    const dto = await call(() =>
      taskApi.updateComment(taskId, id, { bodyHtml: payload.bodyHtml })
    );
    return dtoToComment(dto);
  },

  async delete(id: string, taskId: string): Promise<void> {
    await call(() => taskApi.deleteComment(taskId, id));
  },
};

const mockCommentService = {
  async list(taskId: string): Promise<TaskComment[]> {
    await delay();
    await taskService.getById(taskId);
    seedIfNeeded(taskId);
    return [...(commentsByTask.get(taskId) ?? [])].sort((a, b) =>
      a.createdAt.localeCompare(b.createdAt)
    );
  },

  async create(payload: CreateCommentPayload): Promise<TaskComment> {
    await delay(300);
    await taskService.getById(payload.taskId);
    const text = payload.bodyHtml.replace(/<[^>]*>/g, "").trim();
    if (!text) throw new TaskValidationError("Comment cannot be empty");
    seedIfNeeded(payload.taskId);
    commentSeq += 1;
    const now = new Date().toISOString();
    const author = currentAuthor();
    const comment: TaskComment = {
      id: `cmt_${commentSeq}`,
      taskId: payload.taskId,
      authorId: author.id,
      authorName: author.name,
      authorAvatarUrl: author.avatarUrl,
      bodyHtml: payload.bodyHtml,
      createdAt: now,
      updatedAt: now,
      parentId: payload.parentId,
      edited: false,
    };
    const list = commentsByTask.get(payload.taskId) ?? [];
    commentsByTask.set(payload.taskId, [...list, comment]);
    return comment;
  },

  async update(id: string, taskId: string, payload: UpdateCommentPayload): Promise<TaskComment> {
    await delay(250);
    seedIfNeeded(taskId);
    const list = commentsByTask.get(taskId) ?? [];
    const index = list.findIndex((item) => item.id === id);
    if (index < 0) throw new TaskNotFoundError("Comment not found");
    const next = {
      ...list[index],
      bodyHtml: payload.bodyHtml,
      updatedAt: new Date().toISOString(),
      edited: true,
    };
    list[index] = next;
    commentsByTask.set(taskId, [...list]);
    return next;
  },

  async delete(id: string, taskId: string): Promise<void> {
    await delay(200);
    seedIfNeeded(taskId);
    const list = commentsByTask.get(taskId) ?? [];
    commentsByTask.set(
      taskId,
      list.filter((item) => item.id !== id)
    );
  },
};

export const commentService = new Proxy(mockCommentService, {
  get(target, prop, receiver) {
    const api = isTaskApiEnabled() ? liveCommentService : target;
    const value = Reflect.get(api, prop, receiver);
    return typeof value === "function" ? value.bind(api) : value;
  },
});
