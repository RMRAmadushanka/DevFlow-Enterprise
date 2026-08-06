"use client";

import * as React from "react";

import type { Permission } from "./permissions";
import { usePermissionContext } from "./permission-context";

export interface PermissionGuardProps {
  /** Single permission or list (ANY match grants access). */
  permission: Permission | readonly Permission[];
  /** Require every listed permission instead of any. */
  mode?: "any" | "all";
  children: React.ReactNode;
  /** Rendered when access is denied. Defaults to nothing. */
  fallback?: React.ReactNode;
}

/**
 * Declarative permission gate for actions and sections.
 *
 * @example
 * <PermissionGuard permission="project.delete">
 *   <Button>Delete</Button>
 * </PermissionGuard>
 */
export function PermissionGuard({
  permission,
  mode = "any",
  children,
  fallback = null,
}: PermissionGuardProps) {
  const ctx = usePermissionContext();
  const required = Array.isArray(permission) ? permission : [permission];
  const allowed = mode === "all" ? ctx.canAll(required) : ctx.canAny(required);

  if (!allowed) return <>{fallback}</>;
  return <>{children}</>;
}
