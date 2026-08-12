import type {
  CreateProjectPayload,
  Project,
  ProjectAnalytics,
  ProjectDetail,
  ProjectFilters,
  ProjectListResult,
  ProjectMember,
  ProjectSortField,
  UpdateProjectPayload,
} from "../types/project.types";
import {
  ProjectNotFoundError,
  ProjectPermissionError,
  ProjectValidationError,
} from "../utils/errors";
import { isProjectApiEnabled, projectApiService } from "./project-api.service";

const delay = (ms = 350) => new Promise((resolve) => setTimeout(resolve, ms));

function makeAnalytics(): ProjectAnalytics {
  return {
    taskCompletionTrend: [
      { label: "Mon", completed: 8, opened: 5 },
      { label: "Tue", completed: 12, opened: 7 },
      { label: "Wed", completed: 9, opened: 6 },
      { label: "Thu", completed: 14, opened: 4 },
      { label: "Fri", completed: 11, opened: 8 },
    ],
    velocity: [
      { label: "S20", points: 34 },
      { label: "S21", points: 41 },
      { label: "S22", points: 38 },
      { label: "S23", points: 45 },
      { label: "S24", points: 42 },
    ],
    burndown: [
      { label: "D1", remaining: 40, ideal: 40 },
      { label: "D2", remaining: 34, ideal: 32 },
      { label: "D3", remaining: 28, ideal: 24 },
      { label: "D4", remaining: 20, ideal: 16 },
      { label: "D5", remaining: 13, ideal: 8 },
    ],
    workload: [
      { label: "Avery", assigned: 12, completed: 8 },
      { label: "Sam", assigned: 15, completed: 11 },
      { label: "Jordan", assigned: 9, completed: 6 },
    ],
    issueDistribution: [
      { name: "Features", value: 42 },
      { name: "Bugs", value: 18 },
      { name: "Chores", value: 12 },
      { name: "Spikes", value: 6 },
    ],
    healthScore: 86,
  };
}

function seedProjects(): Project[] {
  const now = "2026-08-02T14:20:00.000Z";
  return [
    {
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
      startDate: "2025-01-10",
      tags: ["backend", "platform"],
      labels: ["P0"],
      memberCount: 8,
      taskCount: 120,
      completedTaskCount: 94,
      favorite: true,
      archived: false,
      createdAt: "2025-01-10T10:00:00.000Z",
      updatedAt: now,
      lastActivityAt: now,
    },
    {
      id: "proj_web",
      organizationId: "org_demo",
      key: "WEB",
      name: "Web Console",
      description: "Operator console for engineering workflows and settings.",
      status: "active",
      health: "at_risk",
      visibility: "private",
      progress: 64,
      ownerId: "u_sam",
      ownerName: "Sam Rivera",
      teamId: "team_design",
      teamName: "Design Systems",
      color: "#0EA5E9",
      repositoryUrl: "https://github.com/acme/web-console",
      defaultBranch: "main",
      technologyStack: ["nextjs", "react"],
      language: "TypeScript",
      timezone: "America/New_York",
      tags: ["frontend", "console"],
      labels: ["P1"],
      memberCount: 12,
      taskCount: 210,
      completedTaskCount: 134,
      favorite: false,
      archived: false,
      createdAt: "2025-02-01T10:00:00.000Z",
      updatedAt: "2026-08-02T11:40:00.000Z",
      lastActivityAt: "2026-08-02T12:05:00.000Z",
    },
    {
      id: "proj_mobile",
      organizationId: "org_demo",
      key: "MOB",
      name: "Mobile App",
      description: "Native mobile client for field engineering teams.",
      status: "paused",
      health: "unknown",
      visibility: "private",
      progress: 41,
      ownerId: "u_jordan",
      ownerName: "Jordan Lee",
      color: "#16A34A",
      repositoryUrl: "https://github.com/acme/mobile-app",
      defaultBranch: "develop",
      technologyStack: ["kotlin", "react"],
      language: "Kotlin",
      timezone: "UTC",
      tags: ["mobile"],
      labels: [],
      memberCount: 5,
      taskCount: 88,
      completedTaskCount: 36,
      favorite: false,
      archived: false,
      createdAt: "2025-03-15T10:00:00.000Z",
      updatedAt: "2026-07-28T09:15:00.000Z",
      lastActivityAt: "2026-07-28T09:15:00.000Z",
    },
    {
      id: "proj_infra",
      organizationId: "org_demo",
      key: "INF",
      name: "Infrastructure",
      description: "Terraform modules, clusters, and CI runners.",
      status: "active",
      health: "healthy",
      visibility: "internal",
      progress: 92,
      ownerId: "u_casey",
      ownerName: "Casey Ng",
      teamId: "team_platform",
      teamName: "Platform",
      color: "#7C3AED",
      repositoryUrl: "https://github.com/acme/infrastructure",
      defaultBranch: "main",
      technologyStack: ["go", "python"],
      language: "Go",
      timezone: "UTC",
      tags: ["infra", "devops"],
      labels: ["platform"],
      memberCount: 6,
      taskCount: 64,
      completedTaskCount: 59,
      favorite: true,
      archived: false,
      createdAt: "2024-11-01T10:00:00.000Z",
      updatedAt: "2026-08-01T18:30:00.000Z",
      lastActivityAt: "2026-08-01T18:30:00.000Z",
    },
    {
      id: "proj_docs",
      organizationId: "org_demo",
      key: "DOC",
      name: "Docs Portal",
      description: "Public documentation site and API reference.",
      status: "completed",
      health: "healthy",
      visibility: "public",
      progress: 100,
      ownerId: "u_riley",
      ownerName: "Riley Park",
      color: "#DB2777",
      repositoryUrl: "https://github.com/acme/docs-portal",
      defaultBranch: "main",
      technologyStack: ["nextjs"],
      language: "TypeScript",
      timezone: "UTC",
      tags: ["docs"],
      labels: [],
      memberCount: 3,
      taskCount: 40,
      completedTaskCount: 40,
      favorite: false,
      archived: false,
      createdAt: "2025-06-01T10:00:00.000Z",
      updatedAt: "2026-07-20T16:00:00.000Z",
      lastActivityAt: "2026-07-20T16:00:00.000Z",
    },
    {
      id: "proj_labs",
      organizationId: "org_labs",
      key: "LAB",
      name: "Labs Sandbox",
      description: "Experimental workspace for DevFlow Labs.",
      status: "planning",
      health: "unknown",
      visibility: "private",
      progress: 12,
      ownerId: "1",
      ownerName: "Avery Chen",
      color: "#0891B2",
      defaultBranch: "main",
      technologyStack: ["react"],
      language: "TypeScript",
      timezone: "UTC",
      tags: ["experiment"],
      labels: [],
      memberCount: 2,
      taskCount: 10,
      completedTaskCount: 1,
      favorite: false,
      archived: false,
      createdAt: "2026-01-08T10:00:00.000Z",
      updatedAt: "2026-07-01T10:00:00.000Z",
      lastActivityAt: "2026-07-01T10:00:00.000Z",
    },
  ];
}

let projects = seedProjects();
const favorites = new Set(projects.filter((p) => p.favorite).map((p) => p.id));

function clone<T>(value: T): T {
  return structuredClone(value);
}

function requireProject(id: string): Project {
  const project = projects.find((item) => item.id === id);
  if (!project) throw new ProjectNotFoundError();
  return project;
}

function withFavorite(project: Project): Project {
  return { ...project, favorite: favorites.has(project.id) };
}

function sortProjects(items: Project[], sort: ProjectSortField): Project[] {
  const list = [...items];
  switch (sort) {
    case "name":
      return list.sort((a, b) => a.name.localeCompare(b.name));
    case "oldest":
      return list.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    case "newest":
      return list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    case "updated":
      return list.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    case "activity":
      return list.sort((a, b) => b.lastActivityAt.localeCompare(a.lastActivityAt));
    case "health": {
      const rank = { critical: 0, at_risk: 1, unknown: 2, healthy: 3 };
      return list.sort((a, b) => rank[a.health] - rank[b.health]);
    }
    case "completion":
      return list.sort((a, b) => b.progress - a.progress);
    default:
      return list;
  }
}

function filterProjects(filters: ProjectFilters, sort: ProjectSortField): Project[] {
  const q = filters.q.trim().toLowerCase();
  let list = projects.map(withFavorite);

  if (filters.organizationId) {
    list = list.filter((p) => p.organizationId === filters.organizationId);
  }
  if (filters.status !== "all") {
    list = list.filter((p) => p.status === filters.status);
  }
  if (filters.visibility !== "all") {
    list = list.filter((p) => p.visibility === filters.visibility);
  }
  if (filters.ownerId) {
    list = list.filter((p) => p.ownerId === filters.ownerId);
  }
  if (filters.teamId) {
    list = list.filter((p) => p.teamId === filters.teamId);
  }
  if (filters.technology) {
    list = list.filter((p) => p.technologyStack.includes(filters.technology!));
  }
  if (filters.language) {
    list = list.filter((p) => p.language === filters.language);
  }
  if (filters.archived === true) {
    list = list.filter((p) => p.archived);
  } else if (filters.archived === false) {
    list = list.filter((p) => !p.archived);
  }
  if (filters.favoritesOnly) {
    list = list.filter((p) => p.favorite);
  }
  if (q) {
    list = list.filter((p) => {
      const haystack = [
        p.name,
        p.description,
        p.ownerName,
        p.repositoryUrl ?? "",
        p.key,
        ...p.tags,
        p.status,
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }

  return sortProjects(list, sort);
}

function toDetail(project: Project): ProjectDetail {
  const members: ProjectMember[] = [
    {
      id: `pm_${project.id}_1`,
      projectId: project.id,
      userId: project.ownerId,
      name: project.ownerName,
      email: `${project.ownerName.toLowerCase().replace(/\s+/g, ".")}@acme.com`,
      role: "admin",
      capacity: 16,
      lastActiveAt: project.lastActivityAt,
    },
    {
      id: `pm_${project.id}_2`,
      projectId: project.id,
      userId: "u_sam",
      name: "Sam Rivera",
      email: "sam@acme.com",
      role: "developer",
      capacity: 16,
      lastActiveAt: "2026-08-02T10:00:00.000Z",
    },
    {
      id: `pm_${project.id}_3`,
      projectId: project.id,
      userId: "u_jordan",
      name: "Jordan Lee",
      email: "jordan@acme.com",
      role: "developer",
      capacity: 12,
      lastActiveAt: "2026-08-01T16:00:00.000Z",
    },
  ];

  return {
    ...withFavorite(project),
    statistics: {
      totalTasks: project.taskCount,
      completedTasks: project.completedTaskCount,
      openBugs: Math.max(1, Math.round(project.taskCount * 0.08)),
      sprintProgress: Math.min(100, project.progress + 4),
      velocity: 42,
      deployments: 18,
      contributors: project.memberCount,
      cycleTimeDays: 3.4,
    },
    milestones: [
      {
        id: "ms_1",
        title: "Beta freeze",
        dueDate: "2026-08-15",
        status: "in_progress",
        progress: 70,
      },
      {
        id: "ms_2",
        title: "GA release",
        dueDate: "2026-09-01",
        status: "upcoming",
        progress: 20,
      },
    ],
    members,
    activity: [
      {
        id: "pa_1",
        type: "deployment",
        actorName: project.ownerName,
        summary: "Deployed to staging",
        timestamp: project.lastActivityAt,
        meta: "v2.1.0",
      },
      {
        id: "pa_2",
        type: "member_added",
        actorName: "Avery Chen",
        summary: "Added Sam Rivera",
        timestamp: "2026-07-30T12:00:00.000Z",
      },
      {
        id: "pa_3",
        type: "repository_connected",
        actorName: project.ownerName,
        summary: "Connected GitHub repository",
        timestamp: project.createdAt,
        meta: project.repositoryUrl,
      },
      {
        id: "pa_4",
        type: "created",
        actorName: project.ownerName,
        summary: "Created project",
        timestamp: project.createdAt,
      },
    ],
    repository: project.repositoryUrl
      ? {
          url: project.repositoryUrl,
          defaultBranch: project.defaultBranch,
          latestCommit: "a1b2c3d",
          latestCommitMessage: "Improve deploy pipeline reliability",
          latestRelease: "v2.1.0",
          branchCount: 14,
          openPullRequests: 3,
          health: project.health,
        }
      : undefined,
    environments: [
      {
        id: "env_dev",
        name: "development",
        status: "healthy",
        latestDeployment: "2026-08-02T09:00:00.000Z",
        version: "v2.1.1-dev",
        health: "healthy",
        updatedAt: "2026-08-02T09:00:00.000Z",
      },
      {
        id: "env_test",
        name: "testing",
        status: "healthy",
        latestDeployment: "2026-08-01T15:00:00.000Z",
        version: "v2.1.0",
        health: "healthy",
        updatedAt: "2026-08-01T15:00:00.000Z",
      },
      {
        id: "env_stg",
        name: "staging",
        status: "degraded",
        latestDeployment: "2026-08-02T12:00:00.000Z",
        version: "v2.1.0-rc.2",
        health: "at_risk",
        updatedAt: "2026-08-02T12:00:00.000Z",
      },
      {
        id: "env_prd",
        name: "production",
        status: "healthy",
        latestDeployment: "2026-08-01T18:30:00.000Z",
        version: "v2.0.9",
        health: "healthy",
        updatedAt: "2026-08-01T18:30:00.000Z",
      },
    ],
    analytics: makeAnalytics(),
    upcomingReleases: [
      { id: "rel_1", name: "v2.2.0", date: "2026-08-20", status: "planned" },
      { id: "rel_2", name: "v2.1.1", date: "2026-08-08", status: "ready" },
    ],
  };
}

/** In-memory mock (default). Set NEXT_PUBLIC_USE_PROJECT_API=true to use Phase 4 project-service. */
const mockProjectService = {
  async list(params: {
    filters: ProjectFilters;
    sort: ProjectSortField;
  }): Promise<ProjectListResult> {
    await delay();
    const items = filterProjects(params.filters, params.sort).map(clone);
    return { items, total: items.length };
  },

  async getById(id: string): Promise<ProjectDetail> {
    await delay(280);
    return clone(toDetail(requireProject(id)));
  },

  async create(payload: CreateProjectPayload): Promise<ProjectDetail> {
    await delay();
    const key = payload.key.trim().toUpperCase();
    if (projects.some((p) => p.key === key && p.organizationId === payload.organizationId)) {
      throw new ProjectValidationError("This project key is already in use");
    }
    const now = new Date().toISOString();
    const project: Project = {
      id: `proj_${Date.now().toString(36)}`,
      organizationId: payload.organizationId,
      key,
      name: payload.name.trim(),
      description: payload.description?.trim() ?? "",
      status: "planning",
      health: "unknown",
      visibility: payload.visibility,
      progress: 0,
      ownerId: "1",
      ownerName: "Avery Chen",
      teamId: payload.teamId || undefined,
      color: payload.color,
      icon: payload.icon || undefined,
      repositoryUrl: payload.repositoryUrl || undefined,
      defaultBranch: payload.defaultBranch || "main",
      technologyStack: payload.technologyStack ?? [],
      language: payload.technologyStack?.[0] === "kotlin" ? "Kotlin" : "TypeScript",
      timezone: payload.timezone,
      startDate: payload.startDate || undefined,
      endDate: payload.endDate || undefined,
      tags: payload.tags ?? [],
      labels: payload.labels ?? [],
      memberCount: 1,
      taskCount: 0,
      completedTaskCount: 0,
      favorite: false,
      archived: false,
      createdAt: now,
      updatedAt: now,
      lastActivityAt: now,
    };
    projects = [project, ...projects];
    return clone(toDetail(project));
  },

  async update(id: string, payload: UpdateProjectPayload): Promise<ProjectDetail> {
    await delay();
    const project = requireProject(id);
    if (project.archived && payload.status !== "active") {
      throw new ProjectPermissionError("Archived projects can only be restored");
    }
    Object.assign(project, {
      ...payload,
      name: payload.name?.trim() ?? project.name,
      description: payload.description?.trim() ?? project.description,
      key: payload.key?.toUpperCase() ?? project.key,
      teamId: payload.teamId || project.teamId,
      repositoryUrl: payload.repositoryUrl || project.repositoryUrl,
      updatedAt: new Date().toISOString(),
    });
    return clone(toDetail(project));
  },

  async toggleFavorite(id: string): Promise<Project> {
    await delay(200);
    requireProject(id);
    if (favorites.has(id)) favorites.delete(id);
    else favorites.add(id);
    return clone(withFavorite(requireProject(id)));
  },

  async archive(id: string): Promise<ProjectDetail> {
    await delay();
    const project = requireProject(id);
    project.archived = true;
    project.status = "archived";
    project.updatedAt = new Date().toISOString();
    return clone(toDetail(project));
  },

  async restore(id: string): Promise<ProjectDetail> {
    await delay();
    const project = requireProject(id);
    project.archived = false;
    project.status = "active";
    project.updatedAt = new Date().toISOString();
    return clone(toDetail(project));
  },

  async duplicate(id: string, name: string, key: string): Promise<ProjectDetail> {
    await delay();
    const source = requireProject(id);
    return this.create({
      name,
      key,
      description: source.description,
      organizationId: source.organizationId,
      teamId: source.teamId,
      visibility: source.visibility,
      repositoryUrl: source.repositoryUrl,
      defaultBranch: source.defaultBranch,
      technologyStack: [...source.technologyStack],
      color: source.color,
      icon: source.icon,
      timezone: source.timezone,
      tags: [...source.tags],
      labels: [...source.labels],
    });
  },

  async transferOwnership(id: string, memberId: string, confirmation: string): Promise<ProjectDetail> {
    await delay();
    if (confirmation !== "TRANSFER") {
      throw new ProjectValidationError("Type TRANSFER to confirm");
    }
    const detail = toDetail(requireProject(id));
    const member = detail.members.find((m) => m.id === memberId);
    if (!member) throw new ProjectValidationError("Select a valid member");
    const project = requireProject(id);
    project.ownerId = member.userId;
    project.ownerName = member.name;
    project.updatedAt = new Date().toISOString();
    return clone(toDetail(project));
  },

  async delete(id: string, confirmation: string): Promise<void> {
    await delay();
    const project = requireProject(id);
    if (confirmation !== project.key) {
      throw new ProjectValidationError("Confirmation does not match project key");
    }
    projects = projects.filter((item) => item.id !== id);
    favorites.delete(id);
  },

  async listMembers(projectId: string) {
    await delay(150);
    return clone(toDetail(requireProject(projectId)).members);
  },

  async listActivity(
    projectId: string,
    _params?: { activityType?: string; page?: number; size?: number }
  ) {
    await delay(150);
    const items = clone(toDetail(requireProject(projectId)).activity);
    return { items, total: items.length };
  },

  async updateStatus(id: string, status: Project["status"]) {
    return this.update(id, { status });
  },

  async updateHealth(id: string, health: Project["health"]) {
    await delay();
    const project = requireProject(id);
    project.health = health;
    project.updatedAt = new Date().toISOString();
    return clone(toDetail(project));
  },

  async getSettings(projectId: string) {
    await delay(100);
    const project = requireProject(projectId);
    return {
      id: `settings_${projectId}`,
      projectId,
      defaultVisibility: "PRIVATE" as const,
      allowMemberInvites: true,
      allowGuestAccess: false,
      timezone: project.timezone,
      defaultProjectView: "OVERVIEW" as const,
    };
  },

  async updateSettings(
    projectId: string,
    body: { timezone?: string | null }
  ) {
    await delay();
    const project = requireProject(projectId);
    if (body.timezone != null) project.timezone = body.timezone;
    return this.getSettings(projectId);
  },

  async listTags(projectId: string) {
    await delay(100);
    const project = requireProject(projectId);
    return project.tags.map((name, index) => ({
      id: `tag_${projectId}_${index}`,
      projectId,
      name,
      color: "#2563EB",
    }));
  },

  async addMember(
    projectId: string,
    input: { userId: string; role: ProjectMember["role"] }
  ): Promise<ProjectMember> {
    await delay();
    const detail = toDetail(requireProject(projectId));
    const member: ProjectMember = {
      id: `mem_${Date.now().toString(36)}`,
      projectId,
      userId: input.userId,
      name: `User ${input.userId.slice(0, 8)}`,
      email: "",
      role: input.role,
      capacity: 80,
      lastActiveAt: new Date().toISOString(),
    };
    detail.members.push(member);
    return clone(member);
  },

  async removeMember(projectId: string, userId: string): Promise<void> {
    await delay();
    requireProject(projectId);
    // Mock detail is derived; no persistent member mutation beyond seed data.
    void userId;
  },

  async updateMember(
    projectId: string,
    userId: string,
    input: { role?: ProjectMember["role"] }
  ): Promise<ProjectMember> {
    await delay();
    const members = toDetail(requireProject(projectId)).members;
    const member = members.find((m) => m.userId === userId);
    if (!member) throw new ProjectNotFoundError("Member not found");
    if (input.role) member.role = input.role;
    return clone(member);
  },
};

export const projectService = new Proxy(mockProjectService, {
  get(target, prop, receiver) {
    const api = isProjectApiEnabled() ? projectApiService : target;
    const value = Reflect.get(api, prop, receiver);
    return typeof value === "function" ? value.bind(api) : value;
  },
});
