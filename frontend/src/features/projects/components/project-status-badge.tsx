"use client";

import { StatusBadge } from "@/components/data-display/badges";
import type { Tone } from "@/components/data-display/shared/types";

import type { ProjectStatus } from "../types/project.types";

const STATUS_TONE: Record<ProjectStatus, Tone> = {
  planning: "info",
  active: "success",
  paused: "warning",
  completed: "info",
  archived: "neutral",
};

export interface ProjectStatusBadgeProps {
  status: ProjectStatus;
  size?: "sm" | "md" | "lg";
}

function ProjectStatusBadge({ status, size = "sm" }: ProjectStatusBadgeProps) {
  return (
    <StatusBadge tone={STATUS_TONE[status]} size={size} dot>
      {status}
    </StatusBadge>
  );
}

export { ProjectStatusBadge };
