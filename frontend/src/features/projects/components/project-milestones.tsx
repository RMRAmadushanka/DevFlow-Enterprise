"use client";

import { CalendarDays } from "lucide-react";

import { ProgressBar } from "@/components/data-display/progress";
import { StatusBadge } from "@/components/data-display/badges";
import type { Tone } from "@/components/data-display/shared/types";
import { cn } from "@/lib/utils";

import type { ProjectMilestone } from "../types/project.types";
import { ProjectEmptyState } from "./project-empty-state";

const MILESTONE_TONE: Record<ProjectMilestone["status"], Tone> = {
  upcoming: "info",
  in_progress: "warning",
  completed: "success",
  overdue: "danger",
};

export interface ProjectMilestonesProps {
  milestones: ProjectMilestone[];
  className?: string;
}

function ProjectMilestones({ milestones, className }: ProjectMilestonesProps) {
  if (milestones.length === 0) {
    return (
      <ProjectEmptyState
        variant="no-activity"
        action={undefined}
      />
    );
  }

  return (
    <ul className={cn("flex flex-col gap-3", className)} data-slot="project-milestones">
      {milestones.map((milestone) => (
        <li
          key={milestone.id}
          className="rounded-xl border border-border bg-card p-4"
        >
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="font-medium text-foreground">{milestone.title}</p>
              <p className="mt-0.5 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                <CalendarDays className="size-3.5" aria-hidden />
                <time dateTime={milestone.dueDate}>
                  Due{" "}
                  {new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(
                    new Date(milestone.dueDate)
                  )}
                </time>
              </p>
            </div>
            <StatusBadge tone={MILESTONE_TONE[milestone.status]} size="sm" dot>
              {milestone.status.replace("_", " ")}
            </StatusBadge>
          </div>
          <div className="mt-3 space-y-1.5">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Progress</span>
              <span className="tabular-nums">{milestone.progress}%</span>
            </div>
            <ProgressBar value={milestone.progress} size="sm" />
          </div>
        </li>
      ))}
    </ul>
  );
}

export { ProjectMilestones };
