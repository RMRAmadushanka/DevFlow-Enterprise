import { LABEL_CATALOG, STATUS_LABELS } from "../constants/task.constants";
import type {
  Task,
  TaskActivityItem,
  TaskChecklistItem,
  TaskDetail,
  TaskFilters,
  TaskPriority,
  TaskRelation,
  TaskRelationType,
  TaskSortField,
  TaskStatus,
  TaskUser,
} from "../types/task.types";
import type { TaskComment } from "../types/comment.types";
import type {
  ActivityDto,
  ChecklistItemDto,
  CommentDto,
  RelationDto,
  TaskDetailDto,
  TaskDto,
  TaskLabelDto,
  TaskUserDto,
} from "@/lib/api/types/task";

const STATUS_SET = new Set<string>(Object.keys(STATUS_LABELS));
const PRIORITY_SET = new Set<string>(["critical", "high", "medium", "low", "none"]);
const RELATION_SET = new Set<string>([
  "blocks",
  "blocked_by",
  "related",
  "duplicate",
  "parent",
  "child",
]);
const ACTIVITY_SET = new Set<string>([
  "created",
  "updated",
  "status_changed",
  "assigned",
  "commented",
  "attachment",
  "checklist",
  "moved",
  "time_logged",
  "linked",
]);

export function toUiStatus(raw: string | null | undefined): TaskStatus {
  const value = (raw ?? "todo").toLowerCase();
  return STATUS_SET.has(value) ? (value as TaskStatus) : "todo";
}

export function toUiPriority(raw: string | null | undefined): TaskPriority {
  const value = (raw ?? "medium").toLowerCase();
  return PRIORITY_SET.has(value) ? (value as TaskPriority) : "medium";
}

function toUser(dto: TaskUserDto | null | undefined): TaskUser | undefined {
  if (!dto) return undefined;
  return {
    id: dto.id ?? "unknown",
    name: dto.name || "User",
    email: dto.email || "",
    avatarUrl: dto.avatarUrl ?? undefined,
  };
}

function fallbackReporter(dto: TaskDto): TaskUser {
  return (
    toUser(dto.reporter) ?? {
      id: "unknown",
      name: "Unknown",
      email: "",
    }
  );
}

export function labelDtosFromNames(names: string[]): TaskLabelDto[] {
  return names
    .map((name) => name.trim())
    .filter(Boolean)
    .map((name) => {
      const catalog = LABEL_CATALOG.find(
        (item) => item.name.toLowerCase() === name.toLowerCase()
      );
      return {
        id: catalog?.id ?? `lbl_${name.toLowerCase().replace(/\s+/g, "_")}`,
        name: catalog?.name ?? name,
        color: catalog?.color ?? "#64748B",
      };
    });
}

export function dtoToTask(dto: TaskDto): Task {
  return {
    id: dto.id,
    key: dto.key,
    title: dto.title,
    description: dto.description ?? "",
    status: toUiStatus(dto.status),
    priority: toUiPriority(dto.priority),
    projectId: dto.projectId,
    projectName: dto.projectName,
    sprintId: dto.sprintId ?? undefined,
    sprintName: dto.sprintName ?? undefined,
    assignee: toUser(dto.assignee ?? undefined),
    reporter: fallbackReporter(dto),
    labels: (dto.labels ?? []).map((label) => ({
      id: label.id,
      name: label.name,
      color: label.color,
    })),
    storyPoints: dto.storyPoints ?? undefined,
    estimateMinutes: dto.estimateMinutes ?? undefined,
    dueDate: dto.dueDate ?? undefined,
    startDate: dto.startDate ?? undefined,
    parentId: dto.parentId ?? undefined,
    attachmentCount: dto.attachmentCount ?? 0,
    commentCount: dto.commentCount ?? 0,
    checklistCompleted: dto.checklistCompleted ?? 0,
    checklistTotal: dto.checklistTotal ?? 0,
    favorite: Boolean(dto.favorite),
    watching: Boolean(dto.watching),
    archived: Boolean(dto.archived),
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
  };
}

export function dtoToChecklistItem(dto: ChecklistItemDto): TaskChecklistItem {
  return {
    id: dto.id,
    title: dto.title,
    completed: Boolean(dto.completed),
  };
}

export function dtoToRelation(dto: RelationDto): TaskRelation {
  const type = dto.type.toLowerCase();
  return {
    id: dto.id,
    type: RELATION_SET.has(type) ? (type as TaskRelationType) : "related",
    taskId: dto.taskId,
    taskKey: dto.taskKey,
    taskTitle: dto.taskTitle,
    status: toUiStatus(dto.status),
  };
}

export function dtoToActivity(dto: ActivityDto): TaskActivityItem {
  const type = dto.type.toLowerCase();
  return {
    id: dto.id,
    type: ACTIVITY_SET.has(type) ? (type as TaskActivityItem["type"]) : "updated",
    actorName: dto.actorName || "User",
    summary: dto.summary,
    timestamp: dto.timestamp,
    meta: dto.meta ?? undefined,
  };
}

export function dtoToComment(dto: CommentDto): TaskComment {
  return {
    id: dto.id,
    taskId: dto.taskId,
    authorId: dto.authorId ?? "unknown",
    authorName: dto.authorName,
    authorAvatarUrl: dto.authorAvatarUrl ?? undefined,
    bodyHtml: dto.bodyHtml,
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
    parentId: dto.parentId ?? undefined,
    edited: Boolean(dto.edited),
  };
}

export function dtoToTaskDetail(dto: TaskDetailDto | TaskDto): TaskDetail {
  const task = dtoToTask(dto);
  if (!("checklist" in dto) || !Array.isArray(dto.checklist)) {
    return {
      ...task,
      checklist: [],
      attachments: [],
      relations: [],
      subtasks: [],
      watchers: task.watching
        ? [task.reporter, ...(task.assignee ? [task.assignee] : [])]
        : [],
      activity: [],
      history: [],
      timeTracking: {
        estimatedMinutes: task.estimateMinutes ?? 0,
        loggedMinutes: "loggedMinutes" in dto ? Number(dto.loggedMinutes ?? 0) : 0,
      },
    };
  }

  const detail = dto as TaskDetailDto;
  const watchers = (detail.watchers ?? [])
    .map((user) => toUser(user))
    .filter((user): user is TaskUser => Boolean(user));

  return {
    ...task,
    checklist: (detail.checklist ?? []).map(dtoToChecklistItem),
    attachments: [],
    relations: (detail.relations ?? []).map(dtoToRelation),
    subtasks: (detail.subtasks ?? []).map(dtoToTask),
    watchers:
      watchers.length > 0
        ? watchers
        : task.watching
          ? [task.reporter, ...(task.assignee ? [task.assignee] : [])]
          : [],
    activity: (detail.activity ?? []).map(dtoToActivity),
    history: (detail.history ?? []).map(dtoToActivity),
    timeTracking: {
      estimatedMinutes:
        detail.timeTracking?.estimatedMinutes ?? task.estimateMinutes ?? 0,
      loggedMinutes:
        detail.timeTracking?.loggedMinutes ?? detail.loggedMinutes ?? 0,
    },
  };
}

export function filtersToQuery(
  filters: Partial<TaskFilters> | undefined,
  sort: TaskSortField | undefined,
  page = 0,
  size = 100
): {
  projectId?: string;
  status?: string;
  priority?: string;
  assigneeId?: string;
  reporterId?: string;
  sprintId?: string;
  archived?: boolean;
  search?: string;
  page: number;
  size: number;
  sort?: string;
} {
  const merged = filters ?? {};
  return {
    projectId: merged.projectId ?? undefined,
    status:
      merged.status && merged.status !== "all" ? merged.status : undefined,
    priority:
      merged.priority && merged.priority !== "all" ? merged.priority : undefined,
    assigneeId: merged.assigneeId ?? undefined,
    reporterId: merged.reporterId ?? undefined,
    sprintId: merged.sprintId ?? undefined,
    archived: merged.archived === true ? true : false,
    search: merged.q?.trim() || undefined,
    page,
    size,
    sort: sort ?? "updated",
  };
}

export function isUuid(value: string | undefined | null): boolean {
  if (!value) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value
  );
}
