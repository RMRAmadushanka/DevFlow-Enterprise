"use client";

import type { Permission } from "./permissions";
import { usePermissionContext } from "./permission-context";

/**
 * Imperative permission checks for hooks and event handlers.
 */
export function usePermissions() {
  const ctx = usePermissionContext();

  return {
    role: ctx.role,
    permissions: ctx.permissions,
    can: (permission: Permission) => ctx.can(permission),
    canAny: (permissions: readonly Permission[]) => ctx.canAny(permissions),
    canAll: (permissions: readonly Permission[]) => ctx.canAll(permissions),
  };
}
