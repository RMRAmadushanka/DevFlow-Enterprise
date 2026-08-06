export type TaskStatus =
  | "backlog"
  | "todo"
  | "in_progress"
  | "review"
  | "testing"
  | "done"
  | "blocked"
  | "archived";

export type TaskPriority = "critical" | "high" | "medium" | "low" | "none";

export type TaskViewMode = "board" | "table" | "list" | "calendar";

export type TaskSortField =
  | "newest"
  | "oldest"
  | "priority"
  | "due_date"
  | "updated"
  | "alphabetical";

export type TaskRelationType =
  | "blocks"
  | "blocked_by"
  | "related"
  | "duplicate"
  | "parent"
  | "child";

export interface TaskLabel {
  id: string;
  name: string;
  color: string;
}

export interface TaskUser {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
}

export interface TaskChecklistItem {
  id: string;
  title: string;
  completed: boolean;
}

export interface TaskAttachment {
  id: string;
  name: string;
  size: number;
  mimeType: string;
  url: string;
  uploadedAt: string;
  uploadedBy: string;
}

export interface TaskRelation {
  id: string;
  type: TaskRelationType;
  taskId: string;
  taskKey: string;
  taskTitle: string;
  status: TaskStatus;
}

export interface TaskActivityItem {
  id: string;
  type:
    | "created"
    | "updated"
    | "status_changed"
    | "assigned"
    | "commented"
    | "attachment"
    | "checklist"
    | "moved";
  actorName: string;
  summary: string;
  timestamp: string;
  meta?: string;
}

export interface TaskTimeTracking {
  estimatedMinutes: number;
  loggedMinutes: number;
}

export interface TaskFilters {
  q: string;
  status: TaskStatus | "all";
  priority: TaskPriority | "all";
  assigneeId: string | null;
  reporterId: string | null;
  sprintId: string | null;
  projectId: string | null;
  label: string | null;
  myTasks: boolean;
  overdue: boolean;
  hasAttachments: boolean;
  hasComments: boolean;
  archived: boolean;
}

export interface Task {
  id: string;
  key: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  projectId: string;
  projectName: string;
  sprintId?: string;
  sprintName?: string;
  assignee?: TaskUser;
  reporter: TaskUser;
  labels: TaskLabel[];
  storyPoints?: number;
  estimateMinutes?: number;
  dueDate?: string;
  startDate?: string;
  parentId?: string;
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

export interface TaskDetail extends Task {
  checklist: TaskChecklistItem[];
  attachments: TaskAttachment[];
  relations: TaskRelation[];
  subtasks: Task[];
  watchers: TaskUser[];
  activity: TaskActivityItem[];
  history: TaskActivityItem[];
  timeTracking: TaskTimeTracking;
}

export interface CreateTaskPayload {
  title: string;
  description?: string;
  projectId: string;
  sprintId?: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeId?: string;
  reporterId?: string;
  labels: string[];
  storyPoints?: number;
  estimateMinutes?: number;
  dueDate?: string;
  startDate?: string;
  parentId?: string;
  dependencyIds?: string[];
  checklist?: string[];
}

export type UpdateTaskPayload = Partial<CreateTaskPayload> & {
  status?: TaskStatus;
  favorite?: boolean;
  watching?: boolean;
  archived?: boolean;
};

export interface TaskListResult {
  items: Task[];
  total: number;
}

export interface TaskBoardColumn {
  status: TaskStatus;
  label: string;
  tasks: Task[];
  collapsed?: boolean;
}

export interface BulkTaskUpdate {
  taskIds: string[];
  assigneeId?: string | null;
  status?: TaskStatus;
  priority?: TaskPriority;
  sprintId?: string | null;
  archived?: boolean;
}
