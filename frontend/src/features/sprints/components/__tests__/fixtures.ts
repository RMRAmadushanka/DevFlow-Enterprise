import type {
  BacklogItem,
  BurndownPoint,
  Release,
  Sprint,
  SprintDetail,
  VelocityPoint,
} from "../../types/sprint.types";

export const sampleSprint: Sprint = {
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
  updatedAt: "2026-08-05T12:00:00.000Z",
};

export const sampleBurndown: BurndownPoint[] = [
  { label: "D1", remaining: 42, ideal: 42 },
  { label: "D2", remaining: 36, ideal: 37 },
  { label: "D3", remaining: 30, ideal: 32 },
];

export const sampleVelocity: VelocityPoint[] = [
  { label: "S24", committed: 40, completed: 41 },
  { label: "S25", committed: 42, completed: 28 },
];

export const sampleBacklog: BacklogItem[] = [
  {
    id: "task_3",
    key: "MOB-42",
    title: "Offline cache for project list",
    priority: "medium",
    status: "todo",
    storyPoints: 8,
    epicName: "Mobile reliability",
    sprintId: null,
    projectId: "proj_api",
  },
  {
    id: "task_9",
    key: "API-110",
    title: "Add request tracing headers",
    priority: "high",
    status: "backlog",
    storyPoints: 3,
    epicName: "Observability",
    sprintId: null,
    projectId: "proj_api",
  },
];

export const sampleRelease: Release = {
  id: "rel_1_4",
  name: "Gateway Reliability",
  version: "v1.4.0",
  projectId: "proj_api",
  projectName: "API Gateway",
  releaseDate: "2026-08-15",
  status: "in_progress",
  sprintIds: ["sprint_24", "sprint_25"],
  featureNames: ["Rate limiting", "Auth deprecation"],
  description: "Hardening the edge gateway.",
};

export const sampleSprintDetail: SprintDetail = {
  ...sampleSprint,
  metrics: {
    committedPoints: 42,
    completedPoints: 28,
    remainingPoints: 14,
    totalTasks: 12,
    completedTasks: 7,
    remainingTasks: 5,
    velocity: 38,
    capacityPoints: 48,
    progress: 67,
    health: "healthy",
    remainingDays: 5,
  },
  burndown: sampleBurndown,
  burnup: [
    { label: "D1", completed: 0, scope: 42 },
    { label: "D2", completed: 8, scope: 42 },
  ],
  capacity: [
    {
      userId: "1",
      name: "Avery Chen",
      capacityPoints: 12,
      allocatedPoints: 10,
      availability: 100,
    },
  ],
  taskIds: ["task_1", "task_2"],
  activity: [],
};
