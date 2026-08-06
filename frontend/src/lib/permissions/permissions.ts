import type { Role } from "./roles";
import { hasMinimumRole } from "./roles";

/**
 * Fine-grained permission strings used by `<PermissionGuard />`.
 * Features may extend this union as domains grow — keep names stable.
 */
export const PERMISSIONS = [
  "project.read",
  "project.create",
  "project.update",
  "project.delete",
  "task.read",
  "task.create",
  "task.update",
  "task.delete",
  "sprint.read",
  "sprint.create",
  "sprint.update",
  "sprint.delete",
  "document.read",
  "document.create",
  "document.update",
  "document.delete",
  "repository.read",
  "repository.create",
  "repository.update",
  "repository.delete",
  "deployment.read",
  "deployment.create",
  "monitoring.read",
  "monitoring.update",
  "monitoring.manage",
  "analytics.read",
  "analytics.export",
  "settings.read",
  "settings.update",
  "settings.manage",
  "organization.read",
  "organization.create",
  "organization.update",
  "organization.delete",
  "member.invite",
  "member.remove",
  "member.update",
  "role.manage",
  "team.manage",
  "org.manage",
  "billing.manage",
] as const;

export type Permission = (typeof PERMISSIONS)[number];

/** Default role → permission matrix (architecture baseline; override per org later). */
export const ROLE_PERMISSIONS: Record<Role, readonly Permission[]> = {
  owner: PERMISSIONS,
  admin: PERMISSIONS.filter((p) => p !== "billing.manage" && p !== "organization.delete") as readonly Permission[],
  manager: [
    "project.read",
    "project.create",
    "project.update",
    "task.read",
    "task.create",
    "task.update",
    "task.delete",
    "sprint.read",
    "sprint.create",
    "sprint.update",
    "sprint.delete",
    "document.read",
    "document.create",
    "document.update",
    "document.delete",
    "repository.read",
    "repository.create",
    "repository.update",
    "repository.delete",
    "deployment.read",
    "deployment.create",
    "monitoring.read",
    "monitoring.update",
    "monitoring.manage",
    "analytics.read",
    "analytics.export",
    "settings.read",
    "settings.update",
    "organization.read",
    "member.invite",
    "member.update",
    "team.manage",
  ],
  developer: [
    "project.read",
    "task.read",
    "task.create",
    "task.update",
    "sprint.read",
    "document.read",
    "document.create",
    "document.update",
    "repository.read",
    "repository.create",
    "repository.update",
    "deployment.read",
    "deployment.create",
    "monitoring.read",
    "monitoring.update",
    "analytics.read",
    "settings.read",
    "organization.read",
  ],
  viewer: [
    "project.read",
    "task.read",
    "sprint.read",
    "document.read",
    "repository.read",
    "deployment.read",
    "monitoring.read",
    "analytics.read",
    "settings.read",
    "organization.read",
  ],
};

export function permissionsForRole(role: Role): readonly Permission[] {
  return ROLE_PERMISSIONS[role];
}

export function can(permissions: readonly string[], permission: Permission): boolean {
  return permissions.includes(permission);
}

export function canAny(permissions: readonly string[], required: readonly Permission[]): boolean {
  return required.some((p) => permissions.includes(p));
}

export function canAll(permissions: readonly string[], required: readonly Permission[]): boolean {
  return required.every((p) => permissions.includes(p));
}

export function canWithRole(role: Role, permission: Permission, minimumRole?: Role): boolean {
  if (minimumRole && !hasMinimumRole(role, minimumRole)) return false;
  return can(permissionsForRole(role), permission);
}
