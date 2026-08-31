import { PROJECT_OPTIONS, STATUS_LABELS } from "../constants/sprint.constants";
import type {
  CreateSprintPayload,
  PlanningState,
  Sprint,
  SprintDetail,
  SprintFilters,
  SprintListResult,
  SprintSortField,
  UpdateSprintPayload,
} from "../types/sprint.types";
import { remainingDays } from "../utils/dates";
import { SprintNotFoundError, SprintValidationError } from "../utils/errors";
import { isLiveBackendMode } from "@/lib/api/live-api";
import { isSprintApiEnabled, sprintApiService } from "./sprint-api.service";

const delay = (ms = 280) => new Promise((resolve) => setTimeout(resolve, ms));

function projectName(id: string) {
  return PROJECT_OPTIONS.find((p) => p.value === id)?.label ?? "Unknown project";
}

function makeBurndown(committed: number) {
  const days = ["D1", "D2", "D3", "D4", "D5", "D6", "D7", "D8", "D9", "D10"];
  return days.map((label, index) => {
    const ideal = Math.max(0, Math.round(committed - (committed / (days.length - 1)) * index));
    const remaining = Math.max(
      0,
      Math.round(ideal + (index < 6 ? committed * 0.08 : -committed * 0.05))
    );
    return { label, remaining, ideal };
  });
}

function makeBurnup(committed: number, completed: number) {
  const days = ["D1", "D2", "D3", "D4", "D5", "D6", "D7", "D8", "D9", "D10"];
  return days.map((label, index) => ({
    label,
    completed: Math.min(
      completed,
      Math.round((completed / (days.length - 1)) * index)
    ),
    scope: committed,
  }));
}

function seedSprints(): Sprint[] {
  const now = "2026-08-05T12:00:00.000Z";
  return [
    {
      id: "sprint_25",
      name: "Sprint 25",
      goal: "Stabilize gateway rate limiting and console a11y fixes.",
      description: "Focus on reliability and accessibility debt.",
      projectId: "proj_api",
      projectName: "API Gateway",
      status: "active",
      startDate: "2026-07-28",
      endDate: "2026-08-10",
      capacityPoints: 48,
      storyPointGoal: 42,
      completedPoints: 28,
      committedPoints: 42,
      taskCount: 12,
      completedTaskCount: 7,
      velocity: 38,
      health: "healthy",
      releaseId: "rel_1_4",
      releaseName: "v1.4",
      archived: false,
      createdAt: "2026-07-20T10:00:00.000Z",
      updatedAt: now,
    },
    {
      id: "sprint_26",
      name: "Sprint 26",
      goal: "Ship calendar foundation and offline mobile cache.",
      description: "Planning next iteration across web and mobile.",
      projectId: "proj_web",
      projectName: "Web Console",
      status: "planning",
      startDate: "2026-08-11",
      endDate: "2026-08-24",
      capacityPoints: 40,
      storyPointGoal: 36,
      completedPoints: 0,
      committedPoints: 18,
      taskCount: 6,
      completedTaskCount: 0,
      velocity: 0,
      health: "unknown",
      archived: false,
      createdAt: "2026-08-01T09:00:00.000Z",
      updatedAt: now,
    },
    {
      id: "sprint_24",
      name: "Sprint 24",
      goal: "Complete auth header deprecation.",
      description: "Closed successfully with strong velocity.",
      projectId: "proj_api",
      projectName: "API Gateway",
      status: "completed",
      startDate: "2026-07-14",
      endDate: "2026-07-27",
      capacityPoints: 45,
      storyPointGoal: 40,
      completedPoints: 41,
      committedPoints: 40,
      taskCount: 10,
      completedTaskCount: 10,
      velocity: 41,
      health: "healthy",
      releaseId: "rel_1_4",
      releaseName: "v1.4",
      archived: false,
      createdAt: "2026-07-01T10:00:00.000Z",
      updatedAt: "2026-07-27T18:00:00.000Z",
    },
    {
      id: "sprint_20",
      name: "Sprint 20",
      goal: "Legacy cleanup sprint.",
      description: "Archived historical sprint.",
      projectId: "proj_infra",
      projectName: "Infrastructure",
      status: "archived",
      startDate: "2026-05-01",
      endDate: "2026-05-14",
      capacityPoints: 30,
      storyPointGoal: 28,
      completedPoints: 22,
      committedPoints: 28,
      taskCount: 8,
      completedTaskCount: 6,
      velocity: 22,
      health: "at_risk",
      archived: true,
      createdAt: "2026-04-20T10:00:00.000Z",
      updatedAt: "2026-05-20T10:00:00.000Z",
    },
  ];
}

let sprints = isLiveBackendMode() ? [] : seedSprints();
let sequence = 30;

function toDetail(sprint: Sprint): SprintDetail {
  const progress =
    sprint.committedPoints > 0
      ? Math.round((sprint.completedPoints / sprint.committedPoints) * 100)
      : 0;
  return {
    ...sprint,
    metrics: {
      committedPoints: sprint.committedPoints,
      completedPoints: sprint.completedPoints,
      remainingPoints: Math.max(sprint.committedPoints - sprint.completedPoints, 0),
      totalTasks: sprint.taskCount,
      completedTasks: sprint.completedTaskCount,
      remainingTasks: Math.max(sprint.taskCount - sprint.completedTaskCount, 0),
      velocity: sprint.velocity,
      capacityPoints: sprint.capacityPoints,
      progress,
      health: sprint.health,
      remainingDays: remainingDays(sprint.endDate),
    },
    burndown: makeBurndown(sprint.committedPoints),
    burnup: makeBurnup(sprint.committedPoints, sprint.completedPoints),
    capacity: [
      {
        userId: "1",
        name: "Avery Chen",
        capacityPoints: 12,
        allocatedPoints: 10,
        availability: 100,
      },
      {
        userId: "2",
        name: "Sam Rivera",
        capacityPoints: 12,
        allocatedPoints: 14,
        availability: 90,
      },
      {
        userId: "3",
        name: "Jordan Lee",
        capacityPoints: 12,
        allocatedPoints: 8,
        availability: 100,
      },
      {
        userId: "4",
        name: "Riley Kim",
        capacityPoints: 12,
        allocatedPoints: 10,
        availability: 80,
      },
    ],
    taskIds: ["task_1", "task_2", "task_4", "task_6"],
    activity: [
      {
        id: `${sprint.id}_act_1`,
        actorName: "Avery Chen",
        summary: `created ${sprint.name}`,
        timestamp: sprint.createdAt,
      },
      {
        id: `${sprint.id}_act_2`,
        actorName: "Sam Rivera",
        summary: `updated status to ${STATUS_LABELS[sprint.status]}`,
        timestamp: sprint.updatedAt,
      },
    ],
    review:
      sprint.status === "completed" || sprint.status === "active"
        ? {
            completedTaskIds: ["task_6"],
            incompleteTaskIds: ["task_1", "task_2"],
            velocity: sprint.velocity,
            deploymentSummary: "2 production deployments this sprint.",
            teamPerformance: "On track with minor carry-over risk.",
          }
        : undefined,
    retrospective:
      sprint.status === "completed"
        ? {
            wentWell: [
              {
                id: "rw_1",
                text: "Clear goal and strong pairing",
                votes: 5,
                authorName: "Avery Chen",
              },
            ],
            needsImprovement: [
              {
                id: "ni_1",
                text: "Late scope changes mid-sprint",
                votes: 3,
                authorName: "Sam Rivera",
              },
            ],
            actionItems: [
              {
                id: "ai_1",
                text: "Freeze scope after planning day",
                votes: 4,
                authorName: "Jordan Lee",
              },
            ],
            comments: [
              {
                id: "rc_1",
                authorName: "Riley Kim",
                body: "Great collaboration on the auth work.",
                timestamp: sprint.updatedAt,
              },
            ],
          }
        : undefined,
  };
}

function matches(sprint: Sprint, filters: SprintFilters): boolean {
  if (filters.status !== "all" && sprint.status !== filters.status) return false;
  if (filters.projectId && sprint.projectId !== filters.projectId) return false;
  if (filters.releaseId && sprint.releaseId !== filters.releaseId) return false;
  const q = filters.q.trim().toLowerCase();
  if (q) {
    const haystack = [sprint.name, sprint.goal, sprint.releaseName ?? "", sprint.projectName]
      .join(" ")
      .toLowerCase();
    if (!haystack.includes(q)) return false;
  }
  return true;
}

function sortItems(items: Sprint[], sort: SprintSortField): Sprint[] {
  const copy = [...items];
  copy.sort((a, b) => {
    switch (sort) {
      case "oldest":
        return a.createdAt.localeCompare(b.createdAt);
      case "start_date":
        return a.startDate.localeCompare(b.startDate);
      case "end_date":
        return a.endDate.localeCompare(b.endDate);
      case "velocity":
        return b.velocity - a.velocity;
      case "completion":
        return (
          b.completedPoints / Math.max(b.committedPoints, 1) -
          a.completedPoints / Math.max(a.committedPoints, 1)
        );
      case "newest":
      default:
        return b.createdAt.localeCompare(a.createdAt);
    }
  });
  return copy;
}

const mockSprintService = {
  async list(params: {
    filters?: Partial<SprintFilters>;
    sort?: SprintSortField;
  } = {}): Promise<SprintListResult> {
    await delay();
    const filters: SprintFilters = {
      q: "",
      projectId: null,
      status: "all",
      teamId: null,
      releaseId: null,
      ...params.filters,
    };
    const items = sortItems(
      sprints.filter((sprint) => matches(sprint, filters)),
      params.sort ?? "newest"
    );
    return {
      items,
      total: items.length,
      current: items.find((s) => s.status === "active") ?? null,
      upcoming: items.filter((s) => s.status === "planning"),
      completed: items.filter((s) => s.status === "completed"),
      archived: items.filter((s) => s.status === "archived" || s.archived),
    };
  },

  async getById(id: string): Promise<SprintDetail> {
    await delay();
    const sprint = sprints.find((item) => item.id === id);
    if (!sprint) throw new SprintNotFoundError();
    return toDetail(sprint);
  },

  async create(payload: CreateSprintPayload): Promise<SprintDetail> {
    await delay(400);
    if (!payload.name?.trim()) throw new SprintValidationError("Sprint name is required");
    if (!payload.projectId) throw new SprintValidationError("Project is required");
    if (payload.startDate > payload.endDate) {
      throw new SprintValidationError("End date must be after start date");
    }
    sequence += 1;
    const now = new Date().toISOString();
    const sprint: Sprint = {
      id: `sprint_${sequence}`,
      name: payload.name.trim(),
      goal: payload.goal ?? "",
      description: payload.description ?? "",
      projectId: payload.projectId,
      projectName: projectName(payload.projectId),
      status: "planning",
      startDate: payload.startDate,
      endDate: payload.endDate,
      capacityPoints: payload.capacityPoints,
      storyPointGoal: payload.storyPointGoal,
      completedPoints: 0,
      committedPoints: 0,
      taskCount: 0,
      completedTaskCount: 0,
      velocity: 0,
      health: "unknown",
      archived: false,
      createdAt: now,
      updatedAt: now,
    };
    sprints = [sprint, ...sprints];
    return toDetail(sprint);
  },

  async update(id: string, payload: UpdateSprintPayload): Promise<SprintDetail> {
    await delay(350);
    const index = sprints.findIndex((item) => item.id === id);
    if (index < 0) throw new SprintNotFoundError();
    const current = sprints[index];
    const next: Sprint = {
      ...current,
      name: payload.name?.trim() ?? current.name,
      goal: payload.goal ?? current.goal,
      description: payload.description ?? current.description,
      projectId: payload.projectId ?? current.projectId,
      projectName: payload.projectId
        ? projectName(payload.projectId)
        : current.projectName,
      startDate: payload.startDate ?? current.startDate,
      endDate: payload.endDate ?? current.endDate,
      capacityPoints: payload.capacityPoints ?? current.capacityPoints,
      storyPointGoal: payload.storyPointGoal ?? current.storyPointGoal,
      status: payload.status ?? current.status,
      archived: payload.archived ?? current.archived,
      updatedAt: new Date().toISOString(),
    };
    if (next.archived) next.status = "archived";
    sprints[index] = next;
    return toDetail(next);
  },

  async start(id: string): Promise<SprintDetail> {
    return this.update(id, { status: "active" });
  },

  async complete(id: string): Promise<SprintDetail> {
    return this.update(id, { status: "completed" });
  },

  async archive(id: string): Promise<SprintDetail> {
    return this.update(id, { archived: true, status: "archived" });
  },

  async delete(id: string): Promise<void> {
    await delay(250);
    if (!sprints.some((item) => item.id === id)) throw new SprintNotFoundError();
    sprints = sprints.filter((item) => item.id !== id);
  },

  async duplicate(id: string): Promise<SprintDetail> {
    const source = await this.getById(id);
    return this.create({
      name: `${source.name} (Copy)`,
      goal: source.goal,
      description: source.description,
      projectId: source.projectId,
      startDate: source.startDate,
      endDate: source.endDate,
      capacityPoints: source.capacityPoints,
      storyPointGoal: source.storyPointGoal,
    });
  },

  async planning(id: string): Promise<PlanningState> {
    await delay();
    const sprint = await this.getById(id);
    return {
      backlog: [
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
          projectId: sprint.projectId,
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
          projectId: sprint.projectId,
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
          projectId: sprint.projectId,
        },
      ],
      sprintTasks: [
        {
          id: "task_1",
          key: "API-101",
          title: "Rate limit gateway responses",
          priority: "high",
          status: "in_progress",
          storyPoints: 5,
          epicName: "Gateway",
          sprintId: sprint.id,
          assigneeName: "Sam Rivera",
          projectId: sprint.projectId,
        },
        {
          id: "task_2",
          key: "WEB-88",
          title: "Fix organization switcher focus trap",
          priority: "critical",
          status: "review",
          storyPoints: 3,
          epicName: "A11y",
          sprintId: sprint.id,
          assigneeName: "Avery Chen",
          projectId: sprint.projectId,
        },
      ],
      capacityPoints: sprint.capacityPoints,
      allocatedPoints: 8,
    };
  },

  async moveTasksToSprint(sprintId: string, taskIds: string[]): Promise<PlanningState> {
    await delay(300);
    const planning = await this.planning(sprintId);
    const moving = planning.backlog.filter((item) => taskIds.includes(item.id));
    const remaining = planning.backlog.filter((item) => !taskIds.includes(item.id));
    const sprintTasks = [
      ...planning.sprintTasks,
      ...moving.map((item) => ({ ...item, sprintId })),
    ];
    const allocatedPoints = sprintTasks.reduce(
      (sum, item) => sum + (item.storyPoints ?? 0),
      0
    );
    const index = sprints.findIndex((item) => item.id === sprintId);
    if (index >= 0) {
      sprints[index] = {
        ...sprints[index],
        committedPoints: allocatedPoints,
        taskCount: sprintTasks.length,
        updatedAt: new Date().toISOString(),
      };
    }
    return {
      backlog: remaining,
      sprintTasks,
      capacityPoints: planning.capacityPoints,
      allocatedPoints,
    };
  },

  velocityHistory(): Array<{ label: string; committed: number; completed: number }> {
    return sprints
      .filter((s) => s.status === "completed" || s.status === "active")
      .slice(0, 5)
      .reverse()
      .map((s) => ({
        label: s.name.replace("Sprint ", "S"),
        committed: s.committedPoints,
        completed: s.completedPoints || s.velocity,
      }));
  },
};

export const sprintService = new Proxy(mockSprintService, {
  get(target, prop, receiver) {
    if (isSprintApiEnabled()) {
      const live = Reflect.get(sprintApiService, prop, sprintApiService);
      if (typeof live === "function") {
        return (live as (...args: unknown[]) => unknown).bind(sprintApiService);
      }
    }
    const value = Reflect.get(target, prop, receiver);
    return typeof value === "function" ? value.bind(target) : value;
  },
});
