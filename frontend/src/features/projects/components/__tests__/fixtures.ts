import type {
  Project,
  ProjectAnalytics,
  ProjectDetail,
  ProjectMember,
} from "../../types/project.types";

export const sampleProject: Project = {
  id: "proj_api",
  organizationId: "org_demo",
  key: "API",
  name: "API Gateway",
  description: "Edge gateway, rate limiting, and service mesh control plane.",
  status: "active",
  health: "healthy",
  visibility: "internal",
  progress: 78,
  ownerId: "1",
  ownerName: "Avery Chen",
  teamId: "team_platform",
  teamName: "Platform",
  color: "#2563EB",
  repositoryUrl: "https://github.com/acme/api-gateway",
  defaultBranch: "main",
  technologyStack: ["node", "go"],
  language: "TypeScript",
  timezone: "UTC",
  tags: ["backend", "platform"],
  labels: ["P0"],
  memberCount: 2,
  taskCount: 120,
  completedTaskCount: 94,
  favorite: true,
  archived: false,
  createdAt: "2025-01-10T10:00:00.000Z",
  updatedAt: "2026-08-02T14:20:00.000Z",
  lastActivityAt: "2026-08-02T14:20:00.000Z",
};

export const sampleMembers: ProjectMember[] = [
  {
    id: "pm_1",
    projectId: "proj_api",
    userId: "1",
    name: "Avery Chen",
    email: "avery@acme.com",
    role: "owner",
    capacity: 80,
    lastActiveAt: "2026-08-02T12:00:00.000Z",
  },
  {
    id: "pm_2",
    projectId: "proj_api",
    userId: "2",
    name: "Sam Rivera",
    email: "sam@acme.com",
    role: "developer",
    capacity: 100,
    lastActiveAt: "2026-08-01T09:00:00.000Z",
  },
];

export const sampleAnalytics: ProjectAnalytics = {
  taskCompletionTrend: [
    { label: "Mon", completed: 8, opened: 5 },
    { label: "Tue", completed: 12, opened: 7 },
  ],
  velocity: [
    { label: "S20", points: 34 },
    { label: "S21", points: 41 },
  ],
  burndown: [
    { label: "D1", remaining: 40, ideal: 40 },
    { label: "D2", remaining: 34, ideal: 32 },
  ],
  workload: [
    { label: "Avery", assigned: 12, completed: 8 },
    { label: "Sam", assigned: 15, completed: 11 },
  ],
  issueDistribution: [
    { name: "Features", value: 42 },
    { name: "Bugs", value: 18 },
  ],
  healthScore: 86,
};

export const sampleProjectDetail: ProjectDetail = {
  ...sampleProject,
  statistics: {
    totalTasks: 120,
    completedTasks: 94,
    openBugs: 4,
    sprintProgress: 72,
    velocity: 42,
    deployments: 18,
    contributors: 8,
    cycleTimeDays: 3.2,
  },
  milestones: [],
  members: sampleMembers,
  activity: [
    {
      id: "act_1",
      type: "created",
      actorName: "Avery Chen",
      summary: "created the project",
      timestamp: "2025-01-10T10:00:00.000Z",
    },
  ],
  repository: {
    url: "https://github.com/acme/api-gateway",
    defaultBranch: "main",
    latestCommit: "a1b2c3d",
    latestCommitMessage: "Improve rate limiter",
    latestRelease: "v1.4.0",
    branchCount: 12,
    openPullRequests: 3,
    health: "healthy",
  },
  environments: [],
  analytics: sampleAnalytics,
  upcomingReleases: [],
};
