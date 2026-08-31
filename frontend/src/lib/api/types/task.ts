/** Backend task-service DTOs — not UI feature types. */

import type { PageQuery, PageResponse } from "./envelope";

export interface TaskUserDto {
  id: string | null;
  name: string;
  email: string;
  avatarUrl?: string | null;
}

export interface TaskLabelDto {
  id: string;
  name: string;
  color: string;
}

export interface TaskDto {
  id: string;
  key: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  projectId: string;
  projectName: string;
  sprintId?: string | null;
  sprintName?: string | null;
  assignee?: TaskUserDto | null;
  reporter?: TaskUserDto | null;
  labels: TaskLabelDto[];
  storyPoints?: number | null;
  estimateMinutes?: number | null;
  loggedMinutes?: number;
  dueDate?: string | null;
  startDate?: string | null;
  parentId?: string | null;
  attachmentCount: number;
  commentCount: number;
  checklistCompleted: number;
  checklistTotal: number;
  favorite: boolean;
  watching: boolean;
  archived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ChecklistItemDto {
  id: string;
  title: string;
  completed: boolean;
}

export interface RelationDto {
  id: string;
  type: string;
  taskId: string;
  taskKey: string;
  taskTitle: string;
  status: string;
}

export interface ActivityDto {
  id: string;
  type: string;
  actorName: string;
  summary: string;
  timestamp: string;
  meta?: string | null;
}

export interface TimeTrackingDto {
  estimatedMinutes: number;
  loggedMinutes: number;
}

export interface CommentDto {
  id: string;
  taskId: string;
  authorId: string | null;
  authorName: string;
  authorAvatarUrl?: string | null;
  bodyHtml: string;
  createdAt: string;
  updatedAt: string;
  parentId?: string | null;
  edited: boolean;
}

export interface TimeEntryDto {
  id: string;
  taskId: string;
  userId?: string | null;
  userName: string;
  minutes: number;
  note?: string | null;
  createdAt: string;
}

export interface TaskDetailDto extends TaskDto {
  checklist: ChecklistItemDto[];
  relations: RelationDto[];
  subtasks: TaskDto[];
  activity: ActivityDto[];
  history: ActivityDto[];
  timeTracking: TimeTrackingDto;
  watchers: TaskUserDto[];
  attachments?: unknown[];
}

export interface CreateTaskRequest {
  title: string;
  description?: string | null;
  projectId: string;
  projectKey: string;
  projectName: string;
  organizationId?: string | null;
  sprintId?: string | null;
  sprintName?: string | null;
  status: string;
  priority: string;
  assigneeId?: string | null;
  assigneeName?: string | null;
  assigneeEmail?: string | null;
  reporterId?: string | null;
  reporterName?: string | null;
  reporterEmail?: string | null;
  labels?: TaskLabelDto[] | null;
  storyPoints?: number | null;
  estimateMinutes?: number | null;
  dueDate?: string | null;
  startDate?: string | null;
  parentId?: string | null;
  checklist?: string[] | null;
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string | null;
  projectId?: string | null;
  projectKey?: string | null;
  projectName?: string | null;
  organizationId?: string | null;
  sprintId?: string | null;
  sprintName?: string | null;
  status?: string;
  priority?: string;
  assigneeId?: string | null;
  assigneeName?: string | null;
  assigneeEmail?: string | null;
  reporterId?: string | null;
  reporterName?: string | null;
  reporterEmail?: string | null;
  labels?: TaskLabelDto[] | null;
  storyPoints?: number | null;
  estimateMinutes?: number | null;
  loggedMinutes?: number | null;
  dueDate?: string | null;
  startDate?: string | null;
  parentId?: string | null;
  favorite?: boolean;
  watching?: boolean;
  archived?: boolean;
}

export interface TaskListQuery extends PageQuery {
  projectId?: string;
  organizationId?: string;
  status?: string;
  priority?: string;
  assigneeId?: string;
  reporterId?: string;
  sprintId?: string;
  archived?: boolean;
  search?: string;
}

export type TaskPage = PageResponse<TaskDto>;
