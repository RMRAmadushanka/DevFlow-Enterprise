"use client";

import * as React from "react";

import type { Role } from "./roles";
import type { Permission } from "./permissions";
import { can, canAll, canAny, permissionsForRole } from "./permissions";

export interface PermissionContextValue {
  role: Role | null;
  permissions: readonly string[];
  can: (permission: Permission) => boolean;
  canAny: (permissions: readonly Permission[]) => boolean;
  canAll: (permissions: readonly Permission[]) => boolean;
}

const PermissionContext = React.createContext<PermissionContextValue | null>(null);

export interface PermissionProviderProps {
  role?: Role | null;
  /** Explicit permission list. When omitted, derived from `role`. */
  permissions?: readonly string[];
  children: React.ReactNode;
}

/**
 * Provides the active user's role/permissions to the tree.
 * Mount inside the authenticated route group once session wiring exists.
 */
export function PermissionProvider({
  role = null,
  permissions,
  children,
}: PermissionProviderProps) {
  const resolved = React.useMemo<PermissionContextValue>(() => {
    const list = permissions ?? (role ? permissionsForRole(role) : []);
    return {
      role,
      permissions: list,
      can: (permission) => can(list, permission),
      canAny: (required) => canAny(list, required),
      canAll: (required) => canAll(list, required),
    };
  }, [role, permissions]);

  return <PermissionContext.Provider value={resolved}>{children}</PermissionContext.Provider>;
}

export function usePermissionContext(): PermissionContextValue {
  const ctx = React.useContext(PermissionContext);
  if (!ctx) {
    return {
      role: null,
      permissions: [],
      can: () => false,
      canAny: () => false,
      canAll: () => false,
    };
  }
  return ctx;
}
