"use client";

import { StatusBadge } from "@/components/data-display/badges";
import type { Tone } from "@/components/data-display/shared/types";

import { PRIORITY_LABELS } from "../constants/task.constants";
import type { TaskPriority } from "../types/task.types";

const PRIORITY_TONE: Record<TaskPriority, Tone> = {
  critical: "danger",
  high: "warning",
  medium: "info",
  low: "neutral",
  none: "neutral",
};

export interface PriorityBadgeProps {
  priority: TaskPriority;
  size?: "sm" | "md" | "lg";
}

function PriorityBadge({ priority, size = "sm" }: PriorityBadgeProps) {
  return (
    <StatusBadge tone={PRIORITY_TONE[priority]} size={size}>
      {PRIORITY_LABELS[priority]}
    </StatusBadge>
  );
}

export { PriorityBadge };
