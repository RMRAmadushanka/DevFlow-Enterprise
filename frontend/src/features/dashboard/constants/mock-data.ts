import type {
  DashboardActivityItem,
  DashboardDeployment,
  DashboardFilterOptions,
  DashboardMetric,
  DashboardProject,
  DashboardSprint,
  DashboardSnapshot,
  DonutSlice,
  ChartPoint,
  WorkloadMember,
} from "../types/dashboard.types";

export const MOCK_FILTER_OPTIONS: DashboardFilterOptions = {
  organizations: [
    { value: "org_demo", label: "Acme Corporation" },
    { value: "org_labs", label: "DevFlow Labs" },
    { value: "org_startup", label: "Startup Team" },
  ],
  teams: [
    { value: "team_platform", label: "Platform" },
    { value: "team_design", label: "Design Systems" },
    { value: "team_core", label: "Core" },
  ],
  projects: [
    { value: "proj_api", label: "API Gateway" },
    { value: "proj_web", label: "Web Console" },
    { value: "proj_mobile", label: "Mobile App" },
    { value: "proj_infra", label: "Infrastructure" },
  ],
  environments: [
    { value: "production", label: "Production" },
    { value: "staging", label: "Staging" },
    { value: "preview", label: "Preview" },
    { value: "development", label: "Development" },
  ],
};

export const MOCK_METRICS: DashboardMetric[] = [
  {
    id: "active-projects",
    title: "Active Projects",
    value: 24,
    change: 12,
    changeLabel: "vs last month",
    trend: "up",
  },
  {
    id: "open-tasks",
    title: "Open Tasks",
    value: 186,
    change: -4,
    changeLabel: "vs last month",
    trend: "down",
  },
  {
    id: "completed-tasks",
    title: "Completed Tasks",
    value: 412,
    change: 18,
    changeLabel: "vs last month",
    trend: "up",
    variant: "success",
  },
  {
    id: "deploy-success",
    title: "Deployment Success Rate",
    value: "97.4%",
    change: 1.2,
    changeLabel: "vs last month",
    trend: "up",
    variant: "success",
  },
  {
    id: "team-members",
    title: "Team Members",
    value: 48,
    change: 6,
    changeLabel: "vs last month",
    trend: "up",
  },
  {
    id: "system-health",
    title: "System Health",
    value: "Healthy",
    change: 0,
    changeLabel: "all services",
    trend: "flat",
    variant: "success",
    description: "API, CI, and CDN operational",
  },
];

export const MOCK_PROJECTS: DashboardProject[] = [
  {
    id: "proj_api",
    name: "API Gateway",
    status: "active",
    progress: 78,
    memberCount: 8,
    owner: "Avery Chen",
    lastActivityAt: "2026-08-02T14:20:00.000Z",
    updatedAt: "2026-08-02T14:20:00.000Z",
  },
  {
    id: "proj_web",
    name: "Web Console",
    status: "active",
    progress: 64,
    memberCount: 12,
    owner: "Sam Rivera",
    lastActivityAt: "2026-08-02T12:05:00.000Z",
    updatedAt: "2026-08-02T11:40:00.000Z",
  },
  {
    id: "proj_mobile",
    name: "Mobile App",
    status: "paused",
    progress: 41,
    memberCount: 5,
    owner: "Jordan Lee",
    lastActivityAt: "2026-07-28T09:15:00.000Z",
    updatedAt: "2026-07-28T09:15:00.000Z",
  },
  {
    id: "proj_infra",
    name: "Infrastructure",
    status: "active",
    progress: 92,
    memberCount: 6,
    owner: "Casey Ng",
    lastActivityAt: "2026-08-01T18:30:00.000Z",
    updatedAt: "2026-08-01T18:30:00.000Z",
  },
  {
    id: "proj_docs",
    name: "Docs Portal",
    status: "completed",
    progress: 100,
    memberCount: 3,
    owner: "Riley Park",
    lastActivityAt: "2026-07-20T16:00:00.000Z",
    updatedAt: "2026-07-20T16:00:00.000Z",
  },
];

export const MOCK_PROJECT_STATUS: DonutSlice[] = [
  { name: "Active", value: 18, color: "var(--chart-1)" },
  { name: "Completed", value: 9, color: "var(--chart-2)" },
  { name: "Paused", value: 4, color: "var(--chart-3)" },
  { name: "Archived", value: 3, color: "var(--chart-4)" },
];

export const MOCK_ACTIVITY: DashboardActivityItem[] = [
  {
    id: "act_1",
    userName: "John Rivera",
    action: "deployed version 2.1",
    description: "API Gateway → production",
    timestamp: "2026-08-02T15:10:00.000Z",
    meta: "production",
  },
  {
    id: "act_2",
    userName: "Sarah Chen",
    action: "completed Sprint task",
    description: "DF-482 · Auth session refresh",
    timestamp: "2026-08-02T14:42:00.000Z",
    meta: "Sprint 24",
  },
  {
    id: "act_3",
    userName: "Mike Torres",
    action: "created project",
    description: "Observability Pipeline",
    timestamp: "2026-08-02T13:05:00.000Z",
  },
  {
    id: "act_4",
    userName: "Avery Chen",
    action: "invited a member",
    description: "jordan@acme.com as Developer",
    timestamp: "2026-08-02T11:20:00.000Z",
    meta: "Acme Corporation",
  },
  {
    id: "act_5",
    userName: "Casey Ng",
    action: "merged pull request",
    description: "Web Console · #418",
    timestamp: "2026-08-01T19:55:00.000Z",
  },
];

export const MOCK_DEPLOYMENTS: DashboardDeployment[] = [
  {
    id: "dep_1",
    environment: "production",
    version: "v2.1.0",
    status: "success",
    deployedAt: "2026-08-02T15:10:00.000Z",
    author: "John Rivera",
    projectName: "API Gateway",
  },
  {
    id: "dep_2",
    environment: "staging",
    version: "v2.1.1-rc.1",
    status: "building",
    deployedAt: "2026-08-02T15:25:00.000Z",
    author: "Sam Rivera",
    projectName: "Web Console",
  },
  {
    id: "dep_3",
    environment: "preview",
    version: "v1.8.4",
    status: "failed",
    deployedAt: "2026-08-02T10:02:00.000Z",
    author: "Jordan Lee",
    projectName: "Mobile App",
  },
  {
    id: "dep_4",
    environment: "production",
    version: "v3.0.2",
    status: "success",
    deployedAt: "2026-08-01T18:30:00.000Z",
    author: "Casey Ng",
    projectName: "Infrastructure",
  },
  {
    id: "dep_5",
    environment: "staging",
    version: "v2.0.9",
    status: "cancelled",
    deployedAt: "2026-07-31T09:40:00.000Z",
    author: "Riley Park",
    projectName: "Docs Portal",
  },
];

export const MOCK_DEPLOYMENT_TREND: ChartPoint[] = [
  { label: "Mon", deployments: 4, failures: 0 },
  { label: "Tue", deployments: 6, failures: 1 },
  { label: "Wed", deployments: 5, failures: 0 },
  { label: "Thu", deployments: 8, failures: 1 },
  { label: "Fri", deployments: 7, failures: 0 },
  { label: "Sat", deployments: 2, failures: 0 },
  { label: "Sun", deployments: 3, failures: 0 },
];

export const MOCK_SPRINT: DashboardSprint = {
  id: "sprint_24",
  name: "Sprint 24 — Reliability",
  completionPercent: 68,
  remainingDays: 4,
  tasksCompleted: 27,
  tasksRemaining: 13,
  endsAt: "2026-08-06T17:00:00.000Z",
};

export const MOCK_BURNDOWN: ChartPoint[] = [
  { label: "Day 1", remaining: 40, ideal: 40 },
  { label: "Day 2", remaining: 36, ideal: 35 },
  { label: "Day 3", remaining: 33, ideal: 30 },
  { label: "Day 4", remaining: 28, ideal: 25 },
  { label: "Day 5", remaining: 22, ideal: 20 },
  { label: "Day 6", remaining: 18, ideal: 15 },
  { label: "Day 7", remaining: 13, ideal: 10 },
];

export const MOCK_WORKLOAD: WorkloadMember[] = [
  {
    id: "u1",
    name: "Avery Chen",
    assignedTasks: 12,
    completedTasks: 8,
    capacity: 16,
  },
  {
    id: "u2",
    name: "Sam Rivera",
    assignedTasks: 15,
    completedTasks: 11,
    capacity: 16,
  },
  {
    id: "u3",
    name: "Jordan Lee",
    assignedTasks: 9,
    completedTasks: 6,
    capacity: 12,
  },
  {
    id: "u4",
    name: "Casey Ng",
    assignedTasks: 14,
    completedTasks: 10,
    capacity: 16,
  },
  {
    id: "u5",
    name: "Riley Park",
    assignedTasks: 7,
    completedTasks: 7,
    capacity: 12,
  },
];

export const MOCK_SNAPSHOT: DashboardSnapshot = {
  metrics: MOCK_METRICS,
  projects: MOCK_PROJECTS,
  projectStatus: MOCK_PROJECT_STATUS,
  activity: MOCK_ACTIVITY,
  deployments: MOCK_DEPLOYMENTS,
  deploymentTrend: MOCK_DEPLOYMENT_TREND,
  sprint: MOCK_SPRINT,
  burndown: MOCK_BURNDOWN,
  workload: MOCK_WORKLOAD,
  systemHealth: [
    { id: "api", name: "API", status: "healthy", detail: "99.98% uptime" },
    { id: "ci", name: "CI", status: "healthy", detail: "Queue normal" },
    { id: "cdn", name: "CDN", status: "warning", detail: "Elevated latency" },
  ],
};
