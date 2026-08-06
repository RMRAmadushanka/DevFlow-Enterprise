"use client";

import * as React from "react";

import { AuthenticatedShell } from "@/features/auth";

/**
 * Authenticated product routes — AppShell + PermissionProvider via auth feature.
 */
export default function DashboardGroupLayout({ children }: { children: React.ReactNode }) {
  return <AuthenticatedShell>{children}</AuthenticatedShell>;
}
