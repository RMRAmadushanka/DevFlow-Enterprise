/** Backend project-service DTOs (Phase 4) — not UI feature types. */

import type { PageQuery, PageResponse } from "./envelope";

export type ProjectStatus = "PLANNING" | "ACTIVE" | "ON_HOLD" | "COMPLETED" | "ARCHIVED";
export type ProjectHealth = "HEALTHY" | "AT_RISK" | "CRITICAL" | "UNKNOWN";
export type ProjectVisibility = "PRIVATE" | "ORGANIZATION" | "TEAM";
export type ProjectMemberRole =
  | "PROJECT_OWNER"
  | "PROJECT_ADMIN"
  | "PROJECT_MANAGER"
  | "PROJECT_DEVELOPER"
  | "PROJECT_VIEWER"
  | "PROJECT_GUEST";
export type ProjectMemberStatus = "ACTIVE" | "INACTIVE" | "REMOVED";
export type ProjectView = "LIST" | "BOARD" | "TIMELINE" | "OVERVIEW";

export interface ProjectTag {
  id: string;
  projectId?: string;
  name: string;
  color?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface Project {
  id: string;
  organizationId: string;
  name: string;
  slug: string;
  description?: string | null;
  key: string;
  icon?: string | null;
  status: ProjectStatus;
  health: ProjectHealth;
  visibility: ProjectVisibility;
  createdBy?: string;
  archivedAt?: string | null;
  version?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectSummary extends Omit<
  Project,
  "description" | "archivedAt" | "createdBy" | "version"
> {
  memberCount: number;
  favorite: boolean;
  tags?: ProjectTag[];
}

export interface ProjectDetail extends Project {
  memberCount: number;
  favorite: boolean;
  tags?: ProjectTag[];
}

export interface ProjectMember {
  id: string;
  projectId: string;
  userId: string;
  role: ProjectMemberRole;
  status: ProjectMemberStatus;
  joinedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProjectSettings {
  id: string;
  projectId: string;
  defaultVisibility: ProjectVisibility;
  allowMemberInvites: boolean;
  allowGuestAccess: boolean;
  timezone?: string | null;
  defaultProjectView: ProjectView;
  version?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProjectActivity {
  id: string;
  projectId: string;
  actorUserId: string;
  activityType: string;
  description?: string | null;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
}

export interface ProjectFavorite {
  id: string;
  projectId: string;
  userId: string;
  createdAt?: string;
}

export interface CreateProjectRequest {
  organizationId: string;
  name: string;
  description?: string | null;
  key: string;
  icon?: string | null;
  status?: ProjectStatus;
  visibility?: ProjectVisibility;
}

export interface UpdateProjectRequest {
  name?: string;
  description?: string | null;
  icon?: string | null;
  status?: ProjectStatus;
  health?: ProjectHealth;
  visibility?: ProjectVisibility;
}

export interface AddProjectMemberRequest {
  userId: string;
  role: Exclude<ProjectMemberRole, "PROJECT_OWNER">;
}

export interface UpdateProjectMemberRequest {
  role?: ProjectMemberRole;
  status?: ProjectMemberStatus;
}

export interface TransferOwnershipRequest {
  newOwnerUserId: string;
}

export interface UpdateProjectSettingsRequest {
  defaultVisibility?: ProjectVisibility;
  allowMemberInvites?: boolean;
  allowGuestAccess?: boolean;
  timezone?: string | null;
  defaultProjectView?: ProjectView;
}

export interface CreateProjectTagRequest {
  name: string;
  color: string;
}

export interface UpdateProjectTagRequest {
  name?: string;
  color?: string;
}

export interface UpdateProjectStatusRequest {
  status: Exclude<ProjectStatus, "ARCHIVED">;
}

export interface UpdateProjectHealthRequest {
  health: ProjectHealth;
}

export interface ProjectListQuery extends PageQuery {
  organizationId?: string;
  status?: ProjectStatus;
  health?: ProjectHealth;
  visibility?: ProjectVisibility;
  search?: string;
  tag?: string;
  favorite?: boolean;
}

export type ProjectPage<T> = PageResponse<T>;
