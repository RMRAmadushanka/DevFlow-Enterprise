import type {
  Sprint,
  SprintDetail,
  SprintFilters,
  SprintHealth,
  SprintSortField,
  SprintStatus,
} from "../types/sprint.types";
import type { SprintDto, SprintListQuery } from "@/lib/api/types/sprint";

const STATUS_SET = new Set<string>(["planning", "active", "completed", "archived"]);
const HEALTH_SET = new Set<string>(["healthy", "at_risk", "critical", "unknown"]);

export function isUuid(value: string | null | undefined): boolean {
  if (!value) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value
  );
}

export function toUiStatus(raw: string | null | undefined): SprintStatus {
  const value = (raw ?? "planning").toLowerCase();
  return STATUS_SET.has(value) ? (value as SprintStatus) : "planning";
}

export function toUiHealth(raw: string | null | undefined): SprintHealth {
  const value = (raw ?? "unknown").toLowerCase();
  return HEALTH_SET.has(value) ? (value as SprintHealth) : "unknown";
}

export function dtoToSprint(dto: SprintDto): Sprint {
  return {
    id: dto.id,
    name: dto.name,
    goal: dto.goal ?? "",
    description: dto.description ?? "",
    projectId: dto.projectId,
    projectName: dto.projectName,
    status: toUiStatus(dto.status),
    startDate: dto.startDate,
    endDate: dto.endDate,
    capacityPoints: dto.capacityPoints ?? 0,
    storyPointGoal: dto.storyPointGoal ?? 0,
    completedPoints: dto.completedPoints ?? 0,
    committedPoints: dto.committedPoints ?? 0,
    taskCount: dto.taskCount ?? 0,
    completedTaskCount: dto.completedTaskCount ?? 0,
    velocity: dto.velocity ?? 0,
    health: toUiHealth(dto.health),
    archived: Boolean(dto.archived),
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
  };
}

function remainingDays(endDate: string): number {
  const end = new Date(`${endDate}T00:00:00.000Z`).getTime();
  const now = Date.now();
  return Math.max(0, Math.ceil((end - now) / (1000 * 60 * 60 * 24)));
}

export function dtoToSprintDetail(dto: SprintDto): SprintDetail {
  const sprint = dtoToSprint(dto);
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
    burndown: [],
    burnup: [],
    capacity: [],
    taskIds: [],
    activity: [
      {
        id: `${sprint.id}_created`,
        actorName: "System",
        summary: `created ${sprint.name}`,
        timestamp: sprint.createdAt,
      },
    ],
  };
}

export function filtersToQuery(
  filters?: Partial<SprintFilters>,
  sort?: SprintSortField
): SprintListQuery {
  return {
    projectId: filters?.projectId || undefined,
    status: filters?.status && filters.status !== "all" ? filters.status : undefined,
    search: filters?.q?.trim() || undefined,
    archived: filters?.status === "archived" ? true : undefined,
    page: 0,
    size: 100,
    sort: sort ?? "newest",
  };
}
