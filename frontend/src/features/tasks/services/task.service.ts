import {
  LABEL_CATALOG,
  PRIORITY_RANK,
  PROJECT_OPTIONS,
  STATUS_LABELS,
} from "../constants/task.constants";
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
import { TaskNotFoundError, TaskValidationError } from "../utils/errors";
import { isLiveBackendMode } from "@/lib/api/live-api";
import { isTaskApiEnabled, taskApiService } from "./task-api.service";

const delay = (ms = 280) => new Promise((resolve) => setTimeout(resolve, ms));

const USERS = {
  "1": { id: "1", name: "Avery Chen", email: "avery@acme.com" },
  "2": { id: "2", name: "Sam Rivera", email: "sam@acme.com" },
  "3": { id: "3", name: "Jordan Lee", email: "jordan@acme.com" },
  "4": { id: "4", name: "Riley Kim", email: "riley@acme.com" },
} as const;

function projectName(id: string) {
  return PROJECT_OPTIONS.find((p) => p.value === id)?.label ?? "Unknown project";
}

function seedTasks(): Task[] {
  const now = "2026-08-05T10:00:00.000Z";
  return [
    {
      id: "task_1",
      key: "API-101",
      title: "Rate limit gateway responses",
      description: "Add sliding-window rate limiting for public API routes.",
      status: "in_progress",
      priority: "high",
      projectId: "proj_api",
      projectName: "API Gateway",
      sprintId: "sprint_25",
      sprintName: "Sprint 25",
      assignee: USERS["2"],
      reporter: USERS["1"],
      labels: [LABEL_CATALOG[1], LABEL_CATALOG[4]],
      storyPoints: 5,
      estimateMinutes: 480,
      dueDate: "2026-08-08",
      startDate: "2026-08-01",
      attachmentCount: 2,
      commentCount: 3,
      checklistCompleted: 2,
      checklistTotal: 4,
      favorite: true,
      watching: true,
      archived: false,
      createdAt: "2026-07-28T09:00:00.000Z",
      updatedAt: now,
    },
    {
      id: "task_2",
      key: "WEB-88",
      title: "Fix organization switcher focus trap",
      description: "Keyboard users cannot escape the switcher popover on Escape.",
      status: "review",
      priority: "critical",
      projectId: "proj_web",
      projectName: "Web Console",
      sprintId: "sprint_25",
      sprintName: "Sprint 25",
      assignee: USERS["1"],
      reporter: USERS["3"],
      labels: [LABEL_CATALOG[0]],
      storyPoints: 3,
      estimateMinutes: 240,
      dueDate: "2026-08-04",
      attachmentCount: 0,
      commentCount: 5,
      checklistCompleted: 1,
      checklistTotal: 1,
      favorite: false,
      watching: true,
      archived: false,
      createdAt: "2026-07-30T11:00:00.000Z",
      updatedAt: "2026-08-04T16:00:00.000Z",
    },
    {
      id: "task_3",
      key: "MOB-42",
      title: "Offline cache for project list",
      description: "Persist last successful project list for airplane mode.",
      status: "todo",
      priority: "medium",
      projectId: "proj_mobile",
      projectName: "Mobile App",
      sprintId: "sprint_26",
      sprintName: "Sprint 26",
      assignee: USERS["4"],
      reporter: USERS["1"],
      labels: [LABEL_CATALOG[1]],
      storyPoints: 8,
      dueDate: "2026-08-20",
      attachmentCount: 1,
      commentCount: 1,
      checklistCompleted: 0,
      checklistTotal: 3,
      favorite: false,
      watching: false,
      archived: false,
      createdAt: "2026-08-01T08:00:00.000Z",
      updatedAt: "2026-08-03T12:00:00.000Z",
    },
    {
      id: "task_4",
      key: "INFRA-17",
      title: "Rotate staging secrets",
      description: "Rotate database and Redis credentials for staging.",
      status: "testing",
      priority: "high",
      projectId: "proj_infra",
      projectName: "Infrastructure",
      sprintId: "sprint_25",
      sprintName: "Sprint 25",
      assignee: USERS["3"],
      reporter: USERS["1"],
      labels: [LABEL_CATALOG[4], LABEL_CATALOG[2]],
      storyPoints: 2,
      dueDate: "2026-08-06",
      attachmentCount: 0,
      commentCount: 0,
      checklistCompleted: 3,
      checklistTotal: 3,
      favorite: false,
      watching: false,
      archived: false,
      createdAt: "2026-07-25T10:00:00.000Z",
      updatedAt: "2026-08-05T09:00:00.000Z",
    },
    {
      id: "task_5",
      key: "DOCS-12",
      title: "Document deployment checklist",
      description: "Add runbook for production deploys.",
      status: "backlog",
      priority: "low",
      projectId: "proj_docs",
      projectName: "Docs Portal",
      reporter: USERS["2"],
      labels: [LABEL_CATALOG[2]],
      storyPoints: 1,
      attachmentCount: 0,
      commentCount: 0,
      checklistCompleted: 0,
      checklistTotal: 0,
      favorite: false,
      watching: false,
      archived: false,
      createdAt: "2026-08-02T14:00:00.000Z",
      updatedAt: "2026-08-02T14:00:00.000Z",
    },
    {
      id: "task_6",
      key: "API-99",
      title: "Deprecate legacy auth headers",
      description: "Remove X-Legacy-Token support after client migration.",
      status: "done",
      priority: "medium",
      projectId: "proj_api",
      projectName: "API Gateway",
      sprintId: "sprint_24",
      sprintName: "Sprint 24",
      assignee: USERS["2"],
      reporter: USERS["1"],
      labels: [LABEL_CATALOG[1]],
      storyPoints: 5,
      dueDate: "2026-07-30",
      attachmentCount: 1,
      commentCount: 2,
      checklistCompleted: 2,
      checklistTotal: 2,
      favorite: false,
      watching: false,
      archived: false,
      createdAt: "2026-07-10T09:00:00.000Z",
      updatedAt: "2026-07-30T18:00:00.000Z",
    },
    {
      id: "task_7",
      key: "WEB-91",
      title: "Calendar view foundation",
      description: "Scaffold calendar month grid for tasks with due dates.",
      status: "blocked",
      priority: "medium",
      projectId: "proj_web",
      projectName: "Web Console",
      sprintId: "sprint_26",
      sprintName: "Sprint 26",
      assignee: USERS["1"],
      reporter: USERS["4"],
      labels: [LABEL_CATALOG[3]],
      storyPoints: 5,
      dueDate: "2026-08-15",
      parentId: undefined,
      attachmentCount: 0,
      commentCount: 1,
      checklistCompleted: 0,
      checklistTotal: 2,
      favorite: true,
      watching: true,
      archived: false,
      createdAt: "2026-08-03T10:00:00.000Z",
      updatedAt: "2026-08-05T08:00:00.000Z",
    },
    {
      id: "task_8",
      key: "API-40",
      title: "Archive unused webhook endpoints",
      description: "Remove unused webhook routes from the gateway.",
      status: "archived",
      priority: "low",
      projectId: "proj_api",
      projectName: "API Gateway",
      reporter: USERS["1"],
      labels: [LABEL_CATALOG[2]],
      attachmentCount: 0,
      commentCount: 0,
      checklistCompleted: 0,
      checklistTotal: 0,
      favorite: false,
      watching: false,
      archived: true,
      createdAt: "2026-06-01T10:00:00.000Z",
      updatedAt: "2026-07-01T10:00:00.000Z",
    },
  ];
}

let tasks = isLiveBackendMode() ? [] : seedTasks();
let sequence = 200;

const detailExtras = new Map<string, Partial<TaskDetail>>();

function ensureExtras(task: Task): TaskDetail {
  const existing = detailExtras.get(task.id);
  if (existing) {
    return { ...task, ...existing } as TaskDetail;
  }

  const checklist: TaskChecklistItem[] = Array.from(
    { length: task.checklistTotal },
    (_, index) => ({
      id: `${task.id}_chk_${index + 1}`,
      title: `Checklist item ${index + 1}`,
      completed: index < task.checklistCompleted,
    })
  );

  const detail: TaskDetail = {
    ...task,
    checklist,
    attachments:
      task.attachmentCount > 0
        ? [
            {
              id: `${task.id}_att_1`,
              name: "spec.pdf",
              size: 240_000,
              mimeType: "application/pdf",
              url: "#",
              uploadedAt: task.updatedAt,
              uploadedBy: task.reporter.name,
            },
          ]
        : [],
    relations: task.parentId
      ? [
          {
            id: `${task.id}_rel_1`,
            type: "parent",
            taskId: task.parentId,
            taskKey: "API-100",
            taskTitle: "Parent epic",
            status: "in_progress",
          },
        ]
      : [],
    subtasks: [],
    watchers: task.watching ? [task.reporter, ...(task.assignee ? [task.assignee] : [])] : [],
    activity: [
      {
        id: `${task.id}_act_1`,
        type: "created",
        actorName: task.reporter.name,
        summary: "created this task",
        timestamp: task.createdAt,
      },
      {
        id: `${task.id}_act_2`,
        type: "status_changed",
        actorName: task.assignee?.name ?? task.reporter.name,
        summary: `moved to ${STATUS_LABELS[task.status]}`,
        timestamp: task.updatedAt,
      },
    ],
    history: [
      {
        id: `${task.id}_hist_1`,
        type: "created",
        actorName: task.reporter.name,
        summary: "Task created",
        timestamp: task.createdAt,
      },
    ],
    timeTracking: {
      estimatedMinutes: task.estimateMinutes ?? 0,
      loggedMinutes: Math.round((task.estimateMinutes ?? 0) * 0.4),
    },
  };

  detailExtras.set(task.id, detail);
  return detail;
}

function matchesFilters(task: Task, filters: TaskFilters): boolean {
  if (!filters.archived && task.archived) return false;
  if (filters.archived && !task.archived && filters.status !== "archived") {
    /* show active by default */
  }
  if (filters.status !== "all" && task.status !== filters.status) return false;
  if (filters.priority !== "all" && task.priority !== filters.priority) return false;
  if (filters.projectId && task.projectId !== filters.projectId) return false;
  if (filters.sprintId && task.sprintId !== filters.sprintId) return false;
  if (filters.assigneeId && task.assignee?.id !== filters.assigneeId) return false;
  if (filters.reporterId && task.reporter.id !== filters.reporterId) return false;
  if (filters.label && !task.labels.some((l) => l.name === filters.label || l.id === filters.label)) {
    return false;
  }
  if (filters.myTasks && task.assignee?.id !== "1") return false;
  if (filters.hasAttachments && task.attachmentCount === 0) return false;
  if (filters.hasComments && task.commentCount === 0) return false;
  if (filters.overdue) {
    if (!task.dueDate) return false;
    if (task.status === "done" || task.archived) return false;
    if (new Date(task.dueDate).getTime() >= Date.now()) return false;
  }
  const q = filters.q.trim().toLowerCase();
  if (q) {
    const haystack = [
      task.key,
      task.title,
      task.description,
      task.projectName,
      ...task.labels.map((l) => l.name),
    ]
      .join(" ")
      .toLowerCase();
    if (!haystack.includes(q)) return false;
  }
  return true;
}

function sortTasks(items: Task[], sort: TaskSortField): Task[] {
  const copy = [...items];
  copy.sort((a, b) => {
    switch (sort) {
      case "oldest":
        return a.createdAt.localeCompare(b.createdAt);
      case "priority":
        return PRIORITY_RANK[b.priority] - PRIORITY_RANK[a.priority];
      case "due_date":
        return (a.dueDate ?? "9999").localeCompare(b.dueDate ?? "9999");
      case "updated":
        return b.updatedAt.localeCompare(a.updatedAt);
      case "alphabetical":
        return a.title.localeCompare(b.title);
      case "newest":
      default:
        return b.createdAt.localeCompare(a.createdAt);
    }
  });
  return copy;
}

const mockTaskService = {
  async list(params: {
    filters?: Partial<TaskFilters>;
    sort?: TaskSortField;
  } = {}): Promise<TaskListResult> {
    await delay();
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
    const items = sortTasks(
      tasks.filter((task) => matchesFilters(task, merged)),
      params.sort ?? "updated"
    );
    return { items, total: items.length };
  },

  async getById(id: string): Promise<TaskDetail> {
    await delay();
    const task = tasks.find((item) => item.id === id);
    if (!task) throw new TaskNotFoundError();
    return ensureExtras(task);
  },

  async board(projectId?: string | null): Promise<TaskBoardColumn[]> {
    await delay();
    const columns: TaskStatus[] = [
      "backlog",
      "todo",
      "in_progress",
      "review",
      "testing",
      "done",
      "archived",
    ];
    return columns.map((status) => ({
      status,
      label: STATUS_LABELS[status],
      tasks: tasks.filter(
        (task) =>
          task.status === status &&
          (!projectId || task.projectId === projectId) &&
          (status === "archived" ? task.archived : !task.archived)
      ),
    }));
  },

  async create(payload: CreateTaskPayload): Promise<TaskDetail> {
    await delay(400);
    if (!payload.title?.trim()) throw new TaskValidationError("Title is required");
    if (!payload.projectId) throw new TaskValidationError("Project is required");
    sequence += 1;
    const project = projectName(payload.projectId);
    const keyPrefix = project.split(" ")[0]?.slice(0, 3).toUpperCase() ?? "TSK";
    const now = new Date().toISOString();
    const task: Task = {
      id: `task_${sequence}`,
      key: `${keyPrefix}-${sequence}`,
      title: payload.title.trim(),
      description: payload.description ?? "",
      status: payload.status,
      priority: payload.priority,
      projectId: payload.projectId,
      projectName: project,
      sprintId: payload.sprintId,
      sprintName: payload.sprintId,
      assignee: payload.assigneeId
        ? USERS[payload.assigneeId as keyof typeof USERS]
        : undefined,
      reporter:
        USERS[(payload.reporterId as keyof typeof USERS) ?? "1"] ?? USERS["1"],
      labels: LABEL_CATALOG.filter((label) => payload.labels.includes(label.name)),
      storyPoints: payload.storyPoints,
      estimateMinutes: payload.estimateMinutes,
      dueDate: payload.dueDate || undefined,
      startDate: payload.startDate || undefined,
      parentId: payload.parentId || undefined,
      attachmentCount: 0,
      commentCount: 0,
      checklistCompleted: 0,
      checklistTotal: payload.checklist?.length ?? 0,
      favorite: false,
      watching: false,
      archived: false,
      createdAt: now,
      updatedAt: now,
    };
    tasks = [task, ...tasks];
    const detail = ensureExtras(task);
    if (payload.checklist?.length) {
      detail.checklist = payload.checklist.map((title, index) => ({
        id: `${task.id}_chk_${index + 1}`,
        title,
        completed: false,
      }));
      detailExtras.set(task.id, detail);
    }
    return detail;
  },

  async update(id: string, payload: UpdateTaskPayload): Promise<TaskDetail> {
    await delay(350);
    const index = tasks.findIndex((task) => task.id === id);
    if (index < 0) throw new TaskNotFoundError();
    const current = tasks[index];
    const next: Task = {
      ...current,
      title: payload.title?.trim() ?? current.title,
      description: payload.description ?? current.description,
      status: payload.status ?? current.status,
      priority: payload.priority ?? current.priority,
      projectId: payload.projectId ?? current.projectId,
      projectName: payload.projectId
        ? projectName(payload.projectId)
        : current.projectName,
      sprintId: payload.sprintId === "" ? undefined : payload.sprintId ?? current.sprintId,
      sprintName: payload.sprintId ?? current.sprintName,
      assignee:
        payload.assigneeId === ""
          ? undefined
          : payload.assigneeId
            ? USERS[payload.assigneeId as keyof typeof USERS]
            : current.assignee,
      labels: payload.labels
        ? LABEL_CATALOG.filter((label) => payload.labels!.includes(label.name))
        : current.labels,
      storyPoints: payload.storyPoints ?? current.storyPoints,
      estimateMinutes: payload.estimateMinutes ?? current.estimateMinutes,
      dueDate: payload.dueDate === "" ? undefined : payload.dueDate ?? current.dueDate,
      startDate: payload.startDate === "" ? undefined : payload.startDate ?? current.startDate,
      parentId: payload.parentId === "" ? undefined : payload.parentId ?? current.parentId,
      favorite: payload.favorite ?? current.favorite,
      watching: payload.watching ?? current.watching,
      archived: payload.archived ?? current.archived,
      updatedAt: new Date().toISOString(),
    };
    if (payload.status === "archived" || payload.archived) {
      next.archived = true;
      next.status = "archived";
    }
    tasks[index] = next;
    const extras = detailExtras.get(id);
    const detail = { ...ensureExtras(next), ...extras, ...next };
    detailExtras.set(id, detail);
    return detail;
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
      labels: source.labels.map((l) => l.name),
      storyPoints: source.storyPoints,
      estimateMinutes: source.estimateMinutes,
      dueDate: source.dueDate,
      checklist: source.checklist.map((item) => item.title),
    });
  },

  async delete(id: string): Promise<void> {
    await delay(300);
    const exists = tasks.some((task) => task.id === id);
    if (!exists) throw new TaskNotFoundError();
    tasks = tasks.filter((task) => task.id !== id);
    detailExtras.delete(id);
  },

  async bulkUpdate(payload: BulkTaskUpdate): Promise<Task[]> {
    await delay(350);
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
    await delay(200);
    const task = await this.getById(taskId);
    const completed = checklist.filter((item) => item.completed).length;
    const index = tasks.findIndex((item) => item.id === taskId);
    tasks[index] = {
      ...tasks[index],
      checklistCompleted: completed,
      checklistTotal: checklist.length,
      updatedAt: new Date().toISOString(),
    };
    const detail = {
      ...task,
      ...tasks[index],
      checklist,
    };
    detailExtras.set(taskId, detail);
    return detail;
  },

  async createRelation(
    taskId: string,
    input: { type: import("../types/task.types").TaskRelationType; targetTaskId: string }
  ): Promise<TaskDetail> {
    const detail = await this.getById(taskId);
    const target = await this.getById(input.targetTaskId);
    const relation = {
      id: `rel_${Date.now()}`,
      type: input.type,
      taskId: target.id,
      taskKey: target.key,
      taskTitle: target.title,
      status: target.status,
    };
    const next = {
      ...detail,
      relations: [...detail.relations, relation],
    };
    detailExtras.set(taskId, next);
    return next;
  },

  async deleteRelation(taskId: string, relationId: string): Promise<TaskDetail> {
    const detail = await this.getById(taskId);
    const next = {
      ...detail,
      relations: detail.relations.filter((item) => item.id !== relationId),
    };
    detailExtras.set(taskId, next);
    return next;
  },

  async logTime(
    taskId: string,
    input: { minutes: number; note?: string }
  ): Promise<TaskDetail> {
    const detail = await this.getById(taskId);
    const next = {
      ...detail,
      timeTracking: {
        estimatedMinutes: detail.timeTracking.estimatedMinutes,
        loggedMinutes: detail.timeTracking.loggedMinutes + Math.max(1, Math.round(input.minutes)),
      },
      updatedAt: new Date().toISOString(),
    };
    void input.note;
    detailExtras.set(taskId, next);
    return next;
  },
};

export const taskService = new Proxy(mockTaskService, {
  get(target, prop, receiver) {
    const api = isTaskApiEnabled() ? taskApiService : target;
    const value = Reflect.get(api, prop, receiver);
    return typeof value === "function" ? value.bind(api) : value;
  },
});
