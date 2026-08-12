/**
 * Maps Phase 4 project-service enums/fields ↔ frontend Project UI types.
 * Used when NEXT_PUBLIC_USE_PROJECT_API=true.
 */

import type { Role } from "@/lib/permissions";
import type {
  Project,
  ProjectActivityItem,
  ProjectHealth,
  ProjectMember,
  ProjectStatus,
  ProjectVisibility,
  ProjectSortField,
  ProjectFilters,
} from "../types/project.types";

export type BackendStatus = "PLANNING" | "ACTIVE" | "ON_HOLD" | "COMPLETED" | "ARCHIVED";
export type BackendHealth = "HEALTHY" | "AT_RISK" | "CRITICAL" | "UNKNOWN";
export type BackendVisibility = "PRIVATE" | "ORGANIZATION" | "TEAM";
export type BackendMemberRole =
  | "PROJECT_OWNER"
  | "PROJECT_ADMIN"
  | "PROJECT_MANAGER"
  | "PROJECT_DEVELOPER"
  | "PROJECT_VIEWER"
  | "PROJECT_GUEST";
export type BackendMemberStatus = "ACTIVE" | "INACTIVE" | "REMOVED";

export interface BackendProjectMember {
  id: string;
  projectId: string;
  userId: string;
  role: BackendMemberRole;
  status: BackendMemberStatus;
  joinedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface BackendProjectActivity {
  id: string;
  projectId: string;
  actorUserId: string;
  activityType: string;
  description?: string | null;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
}

export interface BackendProjectSettings {
  id: string;
  projectId: string;
  defaultVisibility: BackendVisibility;
  allowMemberInvites: boolean;
  allowGuestAccess: boolean;
  timezone?: string | null;
  defaultProjectView: string;
  version?: number;
}

export interface BackendProjectSummary {
  id: string;
  organizationId: string;
  name: string;
  slug: string;
  key: string;
  icon?: string | null;
  status: BackendStatus;
  health: BackendHealth;
  visibility: BackendVisibility;
  memberCount: number;
  favorite: boolean;
  tags?: Array<{ id: string; name: string; color?: string | null }>;
  createdAt: string;
  updatedAt: string;
}

export interface BackendProjectDetail extends BackendProjectSummary {
  description?: string | null;
  archivedAt?: string | null;
  createdBy?: string;
  version?: number;
}

export interface BackendPage<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
}

export function toUiStatus(status: BackendStatus): ProjectStatus {
  switch (status) {
    case "PLANNING":
      return "planning";
    case "ACTIVE":
      return "active";
    case "ON_HOLD":
      return "paused";
    case "COMPLETED":
      return "completed";
    case "ARCHIVED":
      return "archived";
    default:
      return "active";
  }
}

export function toBackendStatus(status: ProjectStatus): BackendStatus | undefined {
  switch (status) {
    case "planning":
      return "PLANNING";
    case "active":
      return "ACTIVE";
    case "paused":
      return "ON_HOLD";
    case "completed":
      return "COMPLETED";
    case "archived":
      return "ARCHIVED";
    default:
      return undefined;
  }
}

export function toUiHealth(health: BackendHealth): ProjectHealth {
  switch (health) {
    case "HEALTHY":
      return "healthy";
    case "AT_RISK":
      return "at_risk";
    case "CRITICAL":
      return "critical";
    case "UNKNOWN":
    default:
      return "unknown";
  }
}

export function toBackendHealth(health: ProjectHealth): BackendHealth {
  switch (health) {
    case "healthy":
      return "HEALTHY";
    case "at_risk":
      return "AT_RISK";
    case "critical":
      return "CRITICAL";
    case "unknown":
    default:
      return "UNKNOWN";
  }
}

export function toUiVisibility(visibility: BackendVisibility): ProjectVisibility {
  switch (visibility) {
    case "PRIVATE":
      return "private";
    case "ORGANIZATION":
      return "internal";
    case "TEAM":
      // Phase 4: TEAM is members-only (same access as PRIVATE), not org-wide public.
      return "private";
    default:
      return "private";
  }
}

export function toBackendVisibility(visibility: ProjectVisibility): BackendVisibility {
  switch (visibility) {
    case "private":
      return "PRIVATE";
    case "internal":
      return "ORGANIZATION";
    case "public":
      // Closest Phase 4 semantic: org-visible discovery (not members-only TEAM).
      return "ORGANIZATION";
    default:
      return "PRIVATE";
  }
}

export function toBackendSort(sort: ProjectSortField): string {
  switch (sort) {
    case "name":
      return "name,asc";
    case "oldest":
      return "createdAt,asc";
    case "newest":
      return "createdAt,desc";
    case "updated":
    case "activity":
      return "updatedAt,desc";
    case "health":
      return "health,asc";
    case "completion":
      return "updatedAt,desc";
    default:
      return "createdAt,desc";
  }
}

export function summaryToProject(dto: BackendProjectSummary): Project {
  const status = toUiStatus(dto.status);
  return {
    id: dto.id,
    organizationId: dto.organizationId,
    key: dto.key,
    name: dto.name,
    description: "",
    status,
    health: toUiHealth(dto.health),
    visibility: toUiVisibility(dto.visibility),
    progress: 0,
    ownerId: "",
    ownerName: "",
    color: "#2563EB",
    icon: dto.icon ?? undefined,
    defaultBranch: "main",
    technologyStack: [],
    language: "",
    timezone: "UTC",
    tags: (dto.tags ?? []).map((t) => t.name),
    labels: [],
    memberCount: dto.memberCount,
    taskCount: 0,
    completedTaskCount: 0,
    favorite: dto.favorite,
    archived: status === "archived",
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
    lastActivityAt: dto.updatedAt,
  };
}

export function detailToProject(dto: BackendProjectDetail): Project {
  const base = summaryToProject(dto);
  return {
    ...base,
    description: dto.description ?? "",
    archived: Boolean(dto.archivedAt) || base.status === "archived",
    ownerId: dto.createdBy ?? base.ownerId,
  };
}

export function filtersToQuery(
  filters: ProjectFilters,
  sort: ProjectSortField,
  page = 0,
  size = 50
) {
  const status =
    filters.archived === true
      ? "ARCHIVED"
      : filters.status !== "all"
        ? toBackendStatus(filters.status)
        : undefined;

  return {
    organizationId: filters.organizationId ?? undefined,
    search: filters.q || undefined,
    status,
    visibility:
      filters.visibility !== "all" ? toBackendVisibility(filters.visibility) : undefined,
    favorite: filters.favoritesOnly ? true : undefined,
    sort: toBackendSort(sort),
    page,
    size,
  };
}

/** Map backend PROJECT_* roles onto existing UI Role badges (display only). */
export function toUiMemberRole(role: BackendMemberRole): Role {
  switch (role) {
    case "PROJECT_OWNER":
      return "owner";
    case "PROJECT_ADMIN":
      return "admin";
    case "PROJECT_MANAGER":
      return "manager";
    case "PROJECT_DEVELOPER":
      return "developer";
    case "PROJECT_VIEWER":
    case "PROJECT_GUEST":
    default:
      return "viewer";
  }
}

export function toBackendMemberRole(role: Role): BackendMemberRole {
  switch (role) {
    case "owner":
      return "PROJECT_OWNER";
    case "admin":
      return "PROJECT_ADMIN";
    case "manager":
      return "PROJECT_MANAGER";
    case "developer":
      return "PROJECT_DEVELOPER";
    case "viewer":
    default:
      return "PROJECT_VIEWER";
  }
}

export function toUiMember(
  dto: BackendProjectMember,
  profile?: { name?: string; email?: string; avatarUrl?: string | null }
): ProjectMember {
  const short = dto.userId.slice(0, 8);
  return {
    id: dto.id,
    projectId: dto.projectId,
    userId: dto.userId,
    name: profile?.name?.trim() || `User ${short}`,
    email: profile?.email?.trim() || "",
    avatarUrl: profile?.avatarUrl ?? undefined,
    role: toUiMemberRole(dto.role),
    capacity: dto.role === "PROJECT_OWNER" || dto.role === "PROJECT_ADMIN" ? 100 : 80,
    lastActiveAt: dto.updatedAt ?? dto.joinedAt ?? dto.createdAt ?? new Date().toISOString(),
  };
}

export function toUiActivity(dto: BackendProjectActivity): ProjectActivityItem {
  const type = mapActivityType(dto.activityType);
  return {
    id: dto.id,
    type,
    actorName: `User ${dto.actorUserId.slice(0, 8)}`,
    summary: dto.description?.trim() || dto.activityType,
    timestamp: dto.createdAt,
    meta: dto.activityType,
  };
}

function mapActivityType(activityType: string): ProjectActivityItem["type"] {
  const t = activityType.toUpperCase();
  if (t.includes("MEMBER") || t.includes("OWNERSHIP")) return "member_added";
  if (t.includes("STATUS")) return "status_changed";
  if (t.includes("CREATE") || t.includes("CREATED")) return "created";
  if (t.includes("DEPLOY")) return "deployment";
  if (t.includes("MILESTONE")) return "milestone";
  if (t.includes("REPOSITORY") || t.includes("REPO")) return "repository_connected";
  return "updated";
}
