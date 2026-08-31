import { apiClient } from "../client";
import type {
  ActivityDto,
  ChecklistItemDto,
  CommentDto,
  CreateTaskRequest,
  RelationDto,
  TaskDetailDto,
  TaskDto,
  TaskListQuery,
  TaskPage,
  TimeEntryDto,
  UpdateTaskRequest,
} from "../types/task";

function toQuery(
  query?: TaskListQuery
): Record<string, string | number | boolean | null | undefined> | undefined {
  if (!query) return undefined;
  return {
    projectId: query.projectId,
    organizationId: query.organizationId,
    status: query.status,
    priority: query.priority,
    assigneeId: query.assigneeId,
    reporterId: query.reporterId,
    sprintId: query.sprintId,
    archived: query.archived,
    search: query.search,
    page: query.page,
    size: query.size,
    sort: query.sort,
  };
}

/** Typed Gateway client for task-service (`/api/tasks`). */
export const taskApi = {
  createTask(body: CreateTaskRequest): Promise<TaskDto> {
    return apiClient<TaskDto>("/api/tasks", { method: "POST", body });
  },

  getTasks(query?: TaskListQuery): Promise<TaskPage> {
    return apiClient<TaskPage>("/api/tasks", { query: toQuery(query) });
  },

  getTask(taskId: string): Promise<TaskDto> {
    return apiClient<TaskDto>(`/api/tasks/${taskId}`);
  },

  getTaskDetail(taskId: string): Promise<TaskDetailDto> {
    return apiClient<TaskDetailDto>(`/api/tasks/${taskId}/detail`);
  },

  updateTask(taskId: string, body: UpdateTaskRequest): Promise<TaskDto> {
    return apiClient<TaskDto>(`/api/tasks/${taskId}`, { method: "PATCH", body });
  },

  deleteTask(taskId: string): Promise<void> {
    return apiClient<void>(`/api/tasks/${taskId}`, { method: "DELETE" });
  },

  listComments(taskId: string): Promise<CommentDto[]> {
    return apiClient<CommentDto[]>(`/api/tasks/${taskId}/comments`);
  },

  createComment(
    taskId: string,
    body: { bodyHtml: string; parentId?: string | null }
  ): Promise<CommentDto> {
    return apiClient<CommentDto>(`/api/tasks/${taskId}/comments`, {
      method: "POST",
      body,
    });
  },

  updateComment(
    taskId: string,
    commentId: string,
    body: { bodyHtml: string }
  ): Promise<CommentDto> {
    return apiClient<CommentDto>(`/api/tasks/${taskId}/comments/${commentId}`, {
      method: "PATCH",
      body,
    });
  },

  deleteComment(taskId: string, commentId: string): Promise<void> {
    return apiClient<void>(`/api/tasks/${taskId}/comments/${commentId}`, {
      method: "DELETE",
    });
  },

  listChecklist(taskId: string): Promise<ChecklistItemDto[]> {
    return apiClient<ChecklistItemDto[]>(`/api/tasks/${taskId}/checklist`);
  },

  replaceChecklist(
    taskId: string,
    items: Array<{ id?: string | null; title: string; completed?: boolean }>
  ): Promise<ChecklistItemDto[]> {
    return apiClient<ChecklistItemDto[]>(`/api/tasks/${taskId}/checklist`, {
      method: "PUT",
      body: { items },
    });
  },

  listRelations(taskId: string): Promise<RelationDto[]> {
    return apiClient<RelationDto[]>(`/api/tasks/${taskId}/relations`);
  },

  createRelation(
    taskId: string,
    body: { type: string; targetTaskId: string }
  ): Promise<RelationDto> {
    return apiClient<RelationDto>(`/api/tasks/${taskId}/relations`, {
      method: "POST",
      body,
    });
  },

  deleteRelation(taskId: string, relationId: string): Promise<void> {
    return apiClient<void>(`/api/tasks/${taskId}/relations/${relationId}`, {
      method: "DELETE",
    });
  },

  listActivity(
    taskId: string,
    query?: { category?: "activity" | "history"; page?: number; size?: number }
  ): Promise<{ items?: ActivityDto[] } | ActivityDto[]> {
    return apiClient(`/api/tasks/${taskId}/activity`, { query });
  },

  listTimeEntries(taskId: string): Promise<TimeEntryDto[]> {
    return apiClient<TimeEntryDto[]>(`/api/tasks/${taskId}/time-entries`);
  },

  logTime(
    taskId: string,
    body: { minutes: number; note?: string | null }
  ): Promise<TimeEntryDto> {
    return apiClient<TimeEntryDto>(`/api/tasks/${taskId}/time-entries`, {
      method: "POST",
      body,
    });
  },

  deleteTimeEntry(taskId: string, entryId: string): Promise<void> {
    return apiClient<void>(`/api/tasks/${taskId}/time-entries/${entryId}`, {
      method: "DELETE",
    });
  },
};
