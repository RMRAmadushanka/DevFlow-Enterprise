import type {
  CreateCommentPayload,
  TaskComment,
  UpdateCommentPayload,
} from "../types/comment.types";
import { TaskNotFoundError, TaskValidationError } from "../utils/errors";
import { taskService } from "./task.service";

const delay = (ms = 220) => new Promise((resolve) => setTimeout(resolve, ms));

const commentsByTask = new Map<string, TaskComment[]>();
let commentSeq = 1;

function seedIfNeeded(taskId: string) {
  if (commentsByTask.has(taskId)) return;
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

export const commentService = {
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
    const comment: TaskComment = {
      id: `cmt_${commentSeq}`,
      taskId: payload.taskId,
      authorId: "1",
      authorName: "Avery Chen",
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
