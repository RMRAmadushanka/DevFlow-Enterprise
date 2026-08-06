import { createQueryKeys } from "@/lib/api/query-keys";

import type {
  TaskFilters,
  TaskPriority,
  TaskSortField,
  TaskStatus,
  TaskViewMode,
} from "../types/task.types";

export const TASK_STORAGE_KEY = "devflow.tasks.ui";

export const taskKeys = {
  ...createQueryKeys("tasks"),
  board: (projectId?: string | null) =>
    [...createQueryKeys("tasks").all, "board", projectId ?? "all"] as const,
  comments: (taskId: string) =>
    [...createQueryKeys("tasks").detail(taskId), "comments"] as const,
  attachments: (taskId: string) =>
    [...createQueryKeys("tasks").detail(taskId), "attachments"] as const,
};

export const BOARD_COLUMNS: TaskStatus[] = [
  "backlog",
  "todo",
  "in_progress",
  "review",
  "testing",
  "done",
  "archived",
];

export const STATUS_LABELS: Record<TaskStatus, string> = {
  backlog: "Backlog",
  todo: "To do",
  in_progress: "In progress",
  review: "Review",
  testing: "Testing",
  done: "Done",
  blocked: "Blocked",
  archived: "Archived",
};

export const PRIORITY_LABELS: Record<TaskPriority, string> = {
  critical: "Critical",
  high: "High",
  medium: "Medium",
  low: "Low",
  none: "No priority",
};

export const PRIORITY_RANK: Record<TaskPriority, number> = {
  critical: 5,
  high: 4,
  medium: 3,
  low: 2,
  none: 1,
};

export const DEFAULT_TASK_FILTERS: TaskFilters = {
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
};

export const STATUS_OPTIONS: Array<{ value: TaskStatus | "all"; label: string }> = [
  { value: "all", label: "All statuses" },
  ...BOARD_COLUMNS.map((status) => ({ value: status, label: STATUS_LABELS[status] })),
  { value: "blocked", label: STATUS_LABELS.blocked },
];

export const PRIORITY_OPTIONS: Array<{ value: TaskPriority | "all"; label: string }> = [
  { value: "all", label: "All priorities" },
  { value: "critical", label: PRIORITY_LABELS.critical },
  { value: "high", label: PRIORITY_LABELS.high },
  { value: "medium", label: PRIORITY_LABELS.medium },
  { value: "low", label: PRIORITY_LABELS.low },
  { value: "none", label: PRIORITY_LABELS.none },
];

export const SORT_OPTIONS: Array<{ value: TaskSortField; label: string }> = [
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "priority", label: "Priority" },
  { value: "due_date", label: "Due date" },
  { value: "updated", label: "Recently updated" },
  { value: "alphabetical", label: "Alphabetical" },
];

export const VIEW_OPTIONS: Array<{ value: TaskViewMode; label: string }> = [
  { value: "board", label: "Board" },
  { value: "table", label: "Table" },
  { value: "list", label: "List" },
  { value: "calendar", label: "Calendar" },
];

export const LABEL_CATALOG = [
  { id: "lbl_bug", name: "bug", color: "#EF4444" },
  { id: "lbl_feature", name: "feature", color: "#2563EB" },
  { id: "lbl_chore", name: "chore", color: "#64748B" },
  { id: "lbl_spike", name: "spike", color: "#8B5CF6" },
  { id: "lbl_security", name: "security", color: "#F59E0B" },
];

export const PROJECT_OPTIONS = [
  { value: "proj_api", label: "API Gateway" },
  { value: "proj_web", label: "Web Console" },
  { value: "proj_mobile", label: "Mobile App" },
  { value: "proj_infra", label: "Infrastructure" },
  { value: "proj_docs", label: "Docs Portal" },
];

export const SPRINT_OPTIONS = [
  { value: "sprint_24", label: "Sprint 24" },
  { value: "sprint_25", label: "Sprint 25" },
  { value: "sprint_26", label: "Sprint 26" },
];

export const USER_OPTIONS = [
  { value: "1", label: "Avery Chen" },
  { value: "2", label: "Sam Rivera" },
  { value: "3", label: "Jordan Lee" },
  { value: "4", label: "Riley Kim" },
];
