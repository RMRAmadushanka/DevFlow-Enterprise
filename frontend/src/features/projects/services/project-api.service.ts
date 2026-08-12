/**
 * Phase 4 HTTP adapter for project UI types.
 * Transport: `projectApi` → Gateway → project-service.
 */

import { ApiError, isApiError, projectApi, userApi } from "@/lib/api";
import type {
  ProjectMemberRole,
  ProjectSettings as ApiProjectSettings,
  ProjectTag as ApiProjectTag,
} from "@/lib/api/types/project";

import type {
  CreateProjectPayload,
  Project,
  ProjectActivityItem,
  ProjectDetail,
  ProjectFilters,
  ProjectHealth,
  ProjectListResult,
  ProjectMember,
  ProjectSortField,
  ProjectStatus,
  UpdateProjectPayload,
} from "../types/project.types";
import {
  ProjectNotFoundError,
  ProjectPermissionError,
  ProjectValidationError,
} from "../utils/errors";
import {
  detailToProject,
  filtersToQuery,
  summaryToProject,
  toBackendHealth,
  toBackendMemberRole,
  toBackendStatus,
  toBackendVisibility,
  toUiActivity,
  toUiMember,
  type BackendProjectActivity,
  type BackendProjectDetail,
  type BackendProjectMember,
  type BackendProjectSummary,
} from "./project-api.mappers";

function mapError(error: unknown): never {
  if (isApiError(error)) {
    if (error.status === 401 || error.status === 403) {
      throw new ProjectPermissionError(error.message || "You do not have permission");
    }
    if (error.status === 404) {
      throw new ProjectNotFoundError(error.message || "Project not found");
    }
    if (error.status === 400 || error.status === 409 || error.status === 422) {
      throw new ProjectValidationError(error.message || "Validation failed");
    }
  }
  if (error instanceof ApiError) {
    throw new ProjectValidationError(error.message);
  }
  throw error;
}

async function call<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    mapError(error);
  }
}

function emptyDetailShell(project: Project): ProjectDetail {
  return {
    ...project,
    statistics: {
      totalTasks: 0,
      completedTasks: 0,
      openBugs: 0,
      sprintProgress: 0,
      velocity: 0,
      deployments: 0,
      contributors: project.memberCount,
      cycleTimeDays: 0,
    },
    milestones: [],
    members: [],
    activity: [],
    environments: [],
    analytics: {
      taskCompletionTrend: [],
      velocity: [],
      burndown: [],
      workload: [],
      issueDistribution: [],
      healthScore: healthScore(project.health),
    },
    upcomingReleases: [],
  };
}

function healthScore(health: ProjectHealth): number {
  switch (health) {
    case "healthy":
      return 90;
    case "at_risk":
      return 55;
    case "critical":
      return 25;
    default:
      return 40;
  }
}

async function resolveUserProfiles(userIds: string[]): Promise<
  Map<string, { name?: string; email?: string; avatarUrl?: string | null }>
> {
  const unique = [...new Set(userIds.filter(Boolean))];
  const map = new Map<string, { name?: string; email?: string; avatarUrl?: string | null }>();
  await Promise.all(
    unique.map(async (userId) => {
      try {
        const user = await userApi.getById(userId);
        map.set(userId, {
          name: user.displayName || `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || user.username,
          email: user.email ?? undefined,
          avatarUrl: user.avatarUrl,
        });
      } catch {
        // Display fallbacks in mapper
      }
    })
  );
  return map;
}

async function loadMembers(projectId: string): Promise<ProjectMember[]> {
  const page = await call(() => projectApi.getProjectMembers(projectId, { page: 0, size: 100 }));
  const profiles = await resolveUserProfiles(page.items.map((m) => m.userId));
  return page.items
    .filter((m) => m.status !== "REMOVED")
    .map((m) => toUiMember(m as BackendProjectMember, profiles.get(m.userId)));
}

async function loadActivity(projectId: string): Promise<ProjectActivityItem[]> {
  const page = await call(() =>
    projectApi.getProjectActivity(projectId, { page: 0, size: 50 })
  );
  return page.items.map((item) => toUiActivity(item as BackendProjectActivity));
}

async function loadSettingsTimezone(projectId: string): Promise<string | undefined> {
  try {
    const settings = await call(() => projectApi.getProjectSettings(projectId));
    return settings.timezone ?? undefined;
  } catch {
    return undefined;
  }
}

async function hydrateDetail(dto: BackendProjectDetail): Promise<ProjectDetail> {
  const base = detailToProject(dto);
  const [members, activity, timezone] = await Promise.all([
    loadMembers(dto.id),
    loadActivity(dto.id),
    loadSettingsTimezone(dto.id),
  ]);

  const owner =
    members.find((m) => m.role === "owner") ??
    members.find((m) => m.userId === base.ownerId);

  const project: Project = {
    ...base,
    timezone: timezone ?? base.timezone,
    ownerId: owner?.userId ?? base.ownerId,
    ownerName: owner?.name ?? base.ownerName,
    memberCount: members.length || base.memberCount,
    tags: (dto.tags ?? []).map((t) => t.name),
  };

  const detail = emptyDetailShell(project);
  return {
    ...detail,
    members,
    activity,
    statistics: {
      ...detail.statistics,
      contributors: members.length || project.memberCount,
    },
  };
}

async function syncTags(projectId: string, desiredNames: string[]): Promise<void> {
  const desired = [
    ...new Set(desiredNames.map((name) => name.trim()).filter(Boolean)),
  ];
  const current = await call(() => projectApi.getProjectTags(projectId));
  const desiredSet = new Set(desired);

  for (const tag of current) {
    if (!desiredSet.has(tag.name)) {
      await call(() => projectApi.deleteProjectTag(projectId, tag.id));
    }
  }

  const afterDelete = await call(() => projectApi.getProjectTags(projectId));
  const existing = new Set(afterDelete.map((t) => t.name));
  for (const name of desired) {
    if (!existing.has(name)) {
      await call(() =>
        projectApi.createProjectTag(projectId, { name, color: "#2563EB" })
      );
    }
  }
}

export const projectApiService = {
  async list(params: {
    filters: ProjectFilters;
    sort: ProjectSortField;
    page?: number;
    size?: number;
  }): Promise<ProjectListResult> {
    const query = filtersToQuery(
      params.filters,
      params.sort,
      params.page ?? 0,
      params.size ?? 50
    );
    const page = await call(() =>
      projectApi.getProjects({
        organizationId: typeof query.organizationId === "string" ? query.organizationId : undefined,
        status: query.status as never,
        visibility: query.visibility as never,
        search: typeof query.search === "string" ? query.search : undefined,
        favorite: typeof query.favorite === "boolean" ? query.favorite : undefined,
        page: typeof query.page === "number" ? query.page : 0,
        size: typeof query.size === "number" ? query.size : 50,
        sort: typeof query.sort === "string" ? query.sort : undefined,
      })
    );
    return {
      items: page.items.map((item) => summaryToProject(item as BackendProjectSummary)),
      total: page.totalElements,
    };
  },

  async getById(id: string): Promise<ProjectDetail> {
    const dto = await call(() => projectApi.getProject(id));
    return hydrateDetail(dto as BackendProjectDetail);
  },

  async getSummary(id: string): Promise<Project> {
    const dto = await call(() => projectApi.getProjectSummary(id));
    return summaryToProject(dto as BackendProjectSummary);
  },

  async create(payload: CreateProjectPayload): Promise<ProjectDetail> {
    const dto = await call(() =>
      projectApi.createProject({
        organizationId: payload.organizationId,
        name: payload.name.trim(),
        description: payload.description?.trim() || null,
        key: payload.key.trim().toUpperCase(),
        icon: payload.icon || null,
        visibility: toBackendVisibility(payload.visibility),
      })
    );
    if (payload.tags?.length) {
      await syncTags(dto.id, payload.tags);
    }
    if (payload.timezone) {
      try {
        await call(() =>
          projectApi.updateProjectSettings(dto.id, { timezone: payload.timezone })
        );
      } catch {
        // settings optional on create
      }
    }
    return this.getById(dto.id);
  },

  async update(id: string, payload: UpdateProjectPayload): Promise<ProjectDetail> {
    const body: {
      name?: string;
      description?: string;
      icon?: string;
      status?: ReturnType<typeof toBackendStatus>;
      health?: ReturnType<typeof toBackendHealth>;
      visibility?: ReturnType<typeof toBackendVisibility>;
    } = {};

    if (payload.name !== undefined) body.name = payload.name.trim();
    if (payload.description !== undefined) body.description = payload.description.trim();
    if (payload.icon !== undefined) body.icon = payload.icon;
    if (payload.status !== undefined) body.status = toBackendStatus(payload.status);
    if (payload.health !== undefined) body.health = toBackendHealth(payload.health);
    if (payload.visibility !== undefined) body.visibility = toBackendVisibility(payload.visibility);

    if (Object.keys(body).length > 0) {
      await call(() => projectApi.updateProject(id, body));
    }

    if (payload.timezone !== undefined) {
      await call(() =>
        projectApi.updateProjectSettings(id, { timezone: payload.timezone ?? null })
      );
    }

    if (payload.tags !== undefined) {
      await syncTags(id, payload.tags);
    }

    return this.getById(id);
  },

  async updateStatus(id: string, status: ProjectStatus): Promise<ProjectDetail> {
    const backend = toBackendStatus(status);
    if (!backend || backend === "ARCHIVED") {
      throw new ProjectValidationError("Invalid status for status endpoint");
    }
    await call(() => projectApi.updateProjectStatus(id, { status: backend }));
    return this.getById(id);
  },

  async updateHealth(id: string, health: ProjectHealth): Promise<ProjectDetail> {
    await call(() =>
      projectApi.updateProjectHealth(id, { health: toBackendHealth(health) })
    );
    return this.getById(id);
  },

  async toggleFavorite(id: string): Promise<Project> {
    const current = await call(() => projectApi.getProject(id));
    if (current.favorite) {
      await call(() => projectApi.unfavoriteProject(id));
      return summaryToProject({ ...(current as BackendProjectDetail), favorite: false });
    }
    await call(() => projectApi.favoriteProject(id));
    return summaryToProject({ ...(current as BackendProjectDetail), favorite: true });
  },

  async listFavorites(params?: { page?: number; size?: number }): Promise<ProjectListResult> {
    const page = await call(() =>
      projectApi.getFavoriteProjects({ page: params?.page ?? 0, size: params?.size ?? 50 })
    );
    return {
      items: page.items.map((item) => summaryToProject(item as BackendProjectSummary)),
      total: page.totalElements,
    };
  },

  async archive(id: string): Promise<ProjectDetail> {
    await call(() => projectApi.archiveProject(id));
    return this.getById(id);
  },

  async restore(id: string): Promise<ProjectDetail> {
    await call(() => projectApi.restoreProject(id));
    return this.getById(id);
  },

  async duplicate(id: string, name: string, key: string): Promise<ProjectDetail> {
    const source = await this.getById(id);
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

  async transferOwnership(
    id: string,
    memberIdOrUserId: string,
    confirmation: string
  ): Promise<ProjectDetail> {
    if (confirmation !== "TRANSFER") {
      throw new ProjectValidationError("Type TRANSFER to confirm");
    }
    const members = await loadMembers(id);
    const member =
      members.find((m) => m.userId === memberIdOrUserId) ??
      members.find((m) => m.id === memberIdOrUserId);
    if (!member) {
      throw new ProjectValidationError("Select a valid member");
    }
    await call(() =>
      projectApi.transferProjectOwnership(id, { newOwnerUserId: member.userId })
    );
    return this.getById(id);
  },

  async delete(id: string, confirmation: string): Promise<void> {
    const project = await this.getById(id);
    if (confirmation !== project.key) {
      throw new ProjectValidationError("Confirmation does not match project key");
    }
    await call(() => projectApi.deleteProject(id));
  },

  async listMembers(projectId: string): Promise<ProjectMember[]> {
    return loadMembers(projectId);
  },

  async addMember(
    projectId: string,
    input: { userId: string; role: ProjectMember["role"] }
  ): Promise<ProjectMember> {
    const role = toBackendMemberRole(input.role);
    if (role === "PROJECT_OWNER") {
      throw new ProjectValidationError("Cannot add PROJECT_OWNER via member API");
    }
    const created = await call(() =>
      projectApi.addProjectMember(projectId, {
        userId: input.userId,
        role: role as Exclude<ProjectMemberRole, "PROJECT_OWNER">,
      })
    );
    const profiles = await resolveUserProfiles([created.userId]);
    return toUiMember(created as BackendProjectMember, profiles.get(created.userId));
  },

  async updateMember(
    projectId: string,
    userId: string,
    input: { role?: ProjectMember["role"]; status?: "ACTIVE" | "INACTIVE" | "REMOVED" }
  ): Promise<ProjectMember> {
    const updated = await call(() =>
      projectApi.updateProjectMember(projectId, userId, {
        role: input.role ? toBackendMemberRole(input.role) : undefined,
        status: input.status,
      })
    );
    const profiles = await resolveUserProfiles([updated.userId]);
    return toUiMember(updated as BackendProjectMember, profiles.get(updated.userId));
  },

  async removeMember(projectId: string, userId: string): Promise<void> {
    await call(() => projectApi.removeProjectMember(projectId, userId));
  },

  async getSettings(projectId: string): Promise<ApiProjectSettings> {
    return call(() => projectApi.getProjectSettings(projectId));
  },

  async updateSettings(
    projectId: string,
    body: Parameters<typeof projectApi.updateProjectSettings>[1]
  ): Promise<ApiProjectSettings> {
    return call(() => projectApi.updateProjectSettings(projectId, body));
  },

  async listTags(projectId: string): Promise<ApiProjectTag[]> {
    return call(() => projectApi.getProjectTags(projectId));
  },

  async createTag(
    projectId: string,
    body: { name: string; color: string }
  ): Promise<ApiProjectTag> {
    return call(() => projectApi.createProjectTag(projectId, body));
  },

  async updateTag(
    projectId: string,
    tagId: string,
    body: { name?: string; color?: string }
  ): Promise<ApiProjectTag> {
    return call(() => projectApi.updateProjectTag(projectId, tagId, body));
  },

  async deleteTag(projectId: string, tagId: string): Promise<void> {
    await call(() => projectApi.deleteProjectTag(projectId, tagId));
  },

  async listActivity(
    projectId: string,
    params?: { activityType?: string; page?: number; size?: number }
  ): Promise<{ items: ProjectActivityItem[]; total: number }> {
    const page = await call(() =>
      projectApi.getProjectActivity(projectId, {
        activityType: params?.activityType,
        page: params?.page ?? 0,
        size: params?.size ?? 50,
      })
    );
    return {
      items: page.items.map((item) => toUiActivity(item as BackendProjectActivity)),
      total: page.totalElements,
    };
  },
};

import { resolveLiveApiFlag } from "@/lib/api/live-api";

/** Live project API when flag allows and Gateway + Keycloak are configured. */
export function isProjectApiEnabled(): boolean {
  return resolveLiveApiFlag(process.env.NEXT_PUBLIC_USE_PROJECT_API);
}
