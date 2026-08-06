"use client";

import { StatusBadge } from "@/components/data-display/badges";
import type { Tone } from "@/components/data-display/shared/types";

import { STATUS_LABELS } from "../constants/task.constants";
import type { TaskStatus } from "../types/task.types";

const STATUS_TONE: Record<TaskStatus, Tone> = {
  backlog: "neutral",
  todo: "info",
  in_progress: "info",
  review: "warning",
  testing: "warning",
  done: "success",
  blocked: "danger",
  archived: "neutral",
};

export interface TaskStatusBadgeProps {
  status: TaskStatus;
  size?: "sm" | "md" | "lg";
}

function TaskStatusBadge({ status, size = "sm" }: TaskStatusBadgeProps) {
  return (
    <StatusBadge tone={STATUS_TONE[status]} size={size} dot>
      {STATUS_LABELS[status]}
    </StatusBadge>
  );
}

export { TaskStatusBadge };
