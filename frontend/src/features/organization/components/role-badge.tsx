"use client";

import { ROLE_LABELS, type Role } from "@/lib/permissions";
import { StatusBadge } from "@/components/data-display/badges";
import type { Tone } from "@/components/data-display/shared/types";

const ROLE_TONE: Record<Role, Tone> = {
  owner: "danger",
  admin: "warning",
  manager: "info",
  developer: "success",
  viewer: "neutral",
};

export interface RoleBadgeProps {
  role: Role | string;
  size?: "sm" | "md" | "lg";
}

function RoleBadge({ role, size = "md" }: RoleBadgeProps) {
  const known = role in ROLE_TONE ? (role as Role) : null;
  const label = known ? ROLE_LABELS[known] : role;
  const tone = known ? ROLE_TONE[known] : "neutral";

  return (
    <StatusBadge tone={tone} size={size} aria-label={`Role: ${label}`}>
      {label}
    </StatusBadge>
  );
}

export { RoleBadge };
