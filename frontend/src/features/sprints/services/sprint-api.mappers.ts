import type {
  BacklogItem,
  PlanningState,
  Sprint,
  SprintDetail,
  SprintFilters,
  SprintHealth,
  SprintSortField,
  SprintStatus,
  BurndownPoint,
  VelocityPoint,
} from "../types/sprint.types";
import type {
  BacklogItemDto,
  BurndownPointDto,
  PlanningStateDto,
  SprintActivityDto,
  SprintDto,
  SprintListQuery,
  VelocityPointDto,
} from "@/lib/api/types/sprint";

const STATUS_SET = new Set<string>(["planning", "active", "completed", "archived"]);
const HEALTH_SET = new Set<string>(["healthy", "at_risk", "critical", "unknown"]);
const PRIORITY_SET = new Set<string>(["critical", "high", "medium", "low", "none"]);

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

export function toUiPriority(raw: string | null | undefined): BacklogItem["priority"] {
  const value = (raw ?? "medium").toLowerCase();
  return PRIORITY_SET.has(value) ? (value as BacklogItem["priority"]) : "medium";
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

export function dtoToBurndownPoint(dto: BurndownPointDto): BurndownPoint {
  return {
    label: dto.date,
    remaining: dto.remainingPoints ?? 0,
    ideal: dto.idealPoints ?? 0,
  };
}

// No dedicated burnup endpoint — each burndown snapshot already carries completedPoints,
// so scope (completed + remaining at that point) and completed are derivable directly.
export function burndownToBurnupPoints(
  burndown: BurndownPointDto[]
): SprintDetail["burnup"] {
  return burndown.map((dto) => ({
    label: dto.date,
    completed: dto.completedPoints ?? 0,
    scope: (dto.completedPoints ?? 0) + (dto.remainingPoints ?? 0),
  }));
}

export function dtoToVelocityPoint(dto: VelocityPointDto): VelocityPoint {
  return {
    label: dto.sprintName,
    committed: dto.committedPoints ?? 0,
    completed: dto.completedPoints ?? 0,
  };
}

export function dtoToBacklogItem(dto: BacklogItemDto): BacklogItem {
  return {
    id: dto.id,
    key: dto.key,
    title: dto.title,
    priority: toUiPriority(dto.priority),
    status: dto.status,
    storyPoints: dto.storyPoints ?? undefined,
    epicName: dto.epicName ?? undefined,
    sprintId: dto.sprintId,
    assigneeName: dto.assigneeName ?? undefined,
    projectId: dto.projectId,
  };
}

export function dtoToSprintActivity(dto: SprintActivityDto): SprintDetail["activity"][number] {
  return {
    id: dto.id,
    actorName: dto.actorName ?? "Unknown",
    summary: dto.summary,
    timestamp: dto.createdAt,
  };
}

export function dtoToPlanningState(dto: PlanningStateDto): PlanningState {
  return {
    backlog: dto.backlog.map(dtoToBacklogItem),
    sprintTasks: dto.sprintTasks.map(dtoToBacklogItem),
    capacityPoints: dto.capacityPoints ?? 0,
    allocatedPoints: dto.allocatedPoints ?? 0,
  };
}

export function dtoToSprintDetail(dto: SprintDto, burndown: BurndownPointDto[] = []): SprintDetail {
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
    burndown: burndown.map(dtoToBurndownPoint),
    burnup: burndownToBurnupPoints(burndown),
    // No backend data source for per-member capacity yet — out of scope for this pass.
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
