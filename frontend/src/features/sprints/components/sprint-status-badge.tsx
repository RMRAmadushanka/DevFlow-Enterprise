"use client";

import { StatusBadge } from "@/components/data-display/badges";
import type { Tone } from "@/components/data-display/shared/types";

import { STATUS_LABELS } from "../constants/sprint.constants";
import type { SprintHealth, SprintStatus } from "../types/sprint.types";

const STATUS_TONE: Record<SprintStatus, Tone> = {
  planning: "info",
  active: "success",
  completed: "neutral",
  archived: "neutral",
};

const HEALTH_TONE: Record<SprintHealth, Tone> = {
  healthy: "success",
  at_risk: "warning",
  critical: "danger",
  unknown: "neutral",
};

const HEALTH_LABELS: Record<SprintHealth, string> = {
  healthy: "Healthy",
  at_risk: "At risk",
  critical: "Critical",
  unknown: "Unknown",
};

export interface SprintStatusBadgeProps {
  status: SprintStatus;
  size?: "sm" | "md" | "lg";
}

export interface SprintHealthBadgeProps {
  health: SprintHealth;
  size?: "sm" | "md" | "lg";
}

function SprintStatusBadge({ status, size = "md" }: SprintStatusBadgeProps) {
  return (
    <StatusBadge tone={STATUS_TONE[status]} dot size={size}>
      {STATUS_LABELS[status]}
    </StatusBadge>
  );
}

function SprintHealthBadge({ health, size = "sm" }: SprintHealthBadgeProps) {
  return (
    <StatusBadge tone={HEALTH_TONE[health]} dot size={size}>
      {HEALTH_LABELS[health]}
    </StatusBadge>
  );
}

export { SprintStatusBadge, SprintHealthBadge };
