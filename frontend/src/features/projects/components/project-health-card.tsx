"use client";

import { Activity } from "lucide-react";

import { StatusBadge } from "@/components/data-display/badges";
import type { Tone } from "@/components/data-display/shared/types";
import { cn } from "@/lib/utils";

import { HEALTH_LABELS } from "../constants/project.constants";
import type { ProjectHealth } from "../types/project.types";

const HEALTH_TONE: Record<ProjectHealth, Tone> = {
  healthy: "success",
  at_risk: "warning",
  critical: "danger",
  unknown: "neutral",
};

export interface ProjectHealthCardProps {
  health: ProjectHealth;
  score?: number;
  className?: string;
  compact?: boolean;
}

function ProjectHealthCard({ health, score, className, compact }: ProjectHealthCardProps) {
  if (compact) {
    return (
      <StatusBadge tone={HEALTH_TONE[health]} size="sm" dot>
        {HEALTH_LABELS[health]}
      </StatusBadge>
    );
  }

  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-xl border border-border bg-card p-4",
        className
      )}
      data-slot="project-health-card"
    >
      <div className="flex size-9 items-center justify-center rounded-lg bg-muted">
        <Activity className="size-4 text-muted-foreground" aria-hidden />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">Project health</p>
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <StatusBadge tone={HEALTH_TONE[health]} size="sm" dot>
            {HEALTH_LABELS[health]}
          </StatusBadge>
          {typeof score === "number" ? (
            <span className="text-sm font-semibold text-foreground">{score}/100</span>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export { ProjectHealthCard };
