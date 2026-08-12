import { apiClient } from "../client";
import type {
  AddProjectMemberRequest,
  CreateProjectRequest,
  CreateProjectTagRequest,
  Project,
  ProjectActivity,
  ProjectDetail,
  ProjectFavorite,
  ProjectListQuery,
  ProjectMember,
  ProjectPage,
  ProjectSettings,
  ProjectSummary,
  ProjectTag,
  TransferOwnershipRequest,
  UpdateProjectHealthRequest,
  UpdateProjectMemberRequest,
  UpdateProjectRequest,
  UpdateProjectSettingsRequest,
  UpdateProjectStatusRequest,
  UpdateProjectTagRequest,
} from "../types/project";

function toQuery(
  query?: ProjectListQuery
): Record<string, string | number | boolean | null | undefined> | undefined {
  if (!query) return undefined;
  return {
    organizationId: query.organizationId,
    status: query.status,
    health: query.health,
    visibility: query.visibility,
    search: query.search,
    tag: query.tag,
    favorite: query.favorite,
    page: query.page,
    size: query.size,
    sort: query.sort,
  };
}

/** Typed Gateway client for project-service (`/api/projects`). */
export const projectApi = {
  createProject(body: CreateProjectRequest): Promise<ProjectDetail> {
    return apiClient<ProjectDetail>("/api/projects", { method: "POST", body });
  },

  getProjects(query?: ProjectListQuery): Promise<ProjectPage<ProjectSummary>> {
    return apiClient<ProjectPage<ProjectSummary>>("/api/projects", { query: toQuery(query) });
  },

  getProject(projectId: string): Promise<ProjectDetail> {
    return apiClient<ProjectDetail>(`/api/projects/${projectId}`);
  },

  getProjectSummary(projectId: string): Promise<ProjectSummary> {
    return apiClient<ProjectSummary>(`/api/projects/${projectId}/summary`);
  },

  updateProject(projectId: string, body: UpdateProjectRequest): Promise<Project> {
    return apiClient<Project>(`/api/projects/${projectId}`, { method: "PATCH", body });
  },

  deleteProject(projectId: string): Promise<Project> {
    return apiClient<Project>(`/api/projects/${projectId}`, { method: "DELETE" });
  },

  archiveProject(projectId: string): Promise<Project> {
    return apiClient<Project>(`/api/projects/${projectId}/archive`, { method: "POST" });
  },

  restoreProject(projectId: string): Promise<Project> {
    return apiClient<Project>(`/api/projects/${projectId}/restore`, { method: "POST" });
  },

  updateProjectStatus(projectId: string, body: UpdateProjectStatusRequest): Promise<Project> {
    return apiClient<Project>(`/api/projects/${projectId}/status`, { method: "PATCH", body });
  },

  updateProjectHealth(projectId: string, body: UpdateProjectHealthRequest): Promise<Project> {
    return apiClient<Project>(`/api/projects/${projectId}/health`, { method: "PATCH", body });
  },

  transferProjectOwnership(
    projectId: string,
    body: TransferOwnershipRequest
  ): Promise<Project> {
    return apiClient<Project>(`/api/projects/${projectId}/ownership/transfer`, {
      method: "POST",
      body,
    });
  },

  getProjectMembers(
    projectId: string,
    query?: { page?: number; size?: number }
  ): Promise<ProjectPage<ProjectMember>> {
    return apiClient<ProjectPage<ProjectMember>>(`/api/projects/${projectId}/members`, {
      query,
    });
  },

  addProjectMember(projectId: string, body: AddProjectMemberRequest): Promise<ProjectMember> {
    return apiClient<ProjectMember>(`/api/projects/${projectId}/members`, {
      method: "POST",
      body,
    });
  },

  updateProjectMember(
    projectId: string,
    userId: string,
    body: UpdateProjectMemberRequest
  ): Promise<ProjectMember> {
    return apiClient<ProjectMember>(`/api/projects/${projectId}/members/${userId}`, {
      method: "PATCH",
      body,
    });
  },

  removeProjectMember(projectId: string, userId: string): Promise<void> {
    return apiClient<void>(`/api/projects/${projectId}/members/${userId}`, {
      method: "DELETE",
    });
  },

  getProjectSettings(projectId: string): Promise<ProjectSettings> {
    return apiClient<ProjectSettings>(`/api/projects/${projectId}/settings`);
  },

  updateProjectSettings(
    projectId: string,
    body: UpdateProjectSettingsRequest
  ): Promise<ProjectSettings> {
    return apiClient<ProjectSettings>(`/api/projects/${projectId}/settings`, {
      method: "PATCH",
      body,
    });
  },

  getProjectTags(projectId: string): Promise<ProjectTag[]> {
    return apiClient<ProjectTag[]>(`/api/projects/${projectId}/tags`);
  },

  createProjectTag(projectId: string, body: CreateProjectTagRequest): Promise<ProjectTag> {
    return apiClient<ProjectTag>(`/api/projects/${projectId}/tags`, { method: "POST", body });
  },

  updateProjectTag(
    projectId: string,
    tagId: string,
    body: UpdateProjectTagRequest
  ): Promise<ProjectTag> {
    return apiClient<ProjectTag>(`/api/projects/${projectId}/tags/${tagId}`, {
      method: "PATCH",
      body,
    });
  },

  deleteProjectTag(projectId: string, tagId: string): Promise<void> {
    return apiClient<void>(`/api/projects/${projectId}/tags/${tagId}`, { method: "DELETE" });
  },

  favoriteProject(projectId: string): Promise<ProjectFavorite> {
    return apiClient<ProjectFavorite>(`/api/projects/${projectId}/favorite`, { method: "POST" });
  },

  unfavoriteProject(projectId: string): Promise<void> {
    return apiClient<void>(`/api/projects/${projectId}/favorite`, { method: "DELETE" });
  },

  getFavoriteProjects(query?: {
    page?: number;
    size?: number;
  }): Promise<ProjectPage<ProjectSummary>> {
    return apiClient<ProjectPage<ProjectSummary>>("/api/projects/favorites", { query });
  },

  getProjectActivity(
    projectId: string,
    query?: { activityType?: string; page?: number; size?: number }
  ): Promise<ProjectPage<ProjectActivity>> {
    return apiClient<ProjectPage<ProjectActivity>>(`/api/projects/${projectId}/activity`, {
      query,
    });
  },
};
