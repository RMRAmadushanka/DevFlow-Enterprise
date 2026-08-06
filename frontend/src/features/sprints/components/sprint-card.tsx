"use client";

import Link from "next/link";
import { Calendar, Target, Zap } from "lucide-react";

import { ProgressBar } from "@/components/data-display/progress";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { routes } from "@/config/routes";

import { completionPercent, formatSprintRange } from "../utils/dates";
import type { Sprint } from "../types/sprint.types";
import { SprintHealthBadge, SprintStatusBadge } from "./sprint-status-badge";
import { SprintQuickActions } from "./sprint-quick-actions";

export interface SprintCardProps {
  sprint: Sprint;
  onComplete?: (sprint: Sprint) => void;
  onArchive?: (sprint: Sprint) => void;
  className?: string;
}

function SprintCard({ sprint, onComplete, onArchive, className }: SprintCardProps) {
  const progress = completionPercent(sprint.completedPoints, sprint.committedPoints);

  return (
    <Card
      data-slot="sprint-card"
      className={cn("transition-colors hover:border-ring/40", className)}
    >
      <CardContent className="flex flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <Link
              href={routes.app.sprint(sprint.id)}
              className="text-base font-semibold text-foreground outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring/50"
            >
              {sprint.name}
            </Link>
            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{sprint.goal}</p>
          </div>
          <SprintQuickActions
            sprint={sprint}
            onComplete={onComplete}
            onArchive={onArchive}
            compact
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <SprintStatusBadge status={sprint.status} size="sm" />
          <SprintHealthBadge health={sprint.health} />
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Calendar className="size-3.5" aria-hidden />
            {formatSprintRange(sprint.startDate, sprint.endDate)}
          </span>
          <span className="inline-flex items-center gap-1">
            <Target className="size-3.5" aria-hidden />
            {sprint.completedPoints}/{sprint.committedPoints} pts
          </span>
          {sprint.velocity > 0 ? (
            <span className="inline-flex items-center gap-1">
              <Zap className="size-3.5" aria-hidden />
              {sprint.velocity} velocity
            </span>
          ) : null}
        </div>

        <ProgressBar
          value={progress}
          label="Progress"
          tone={progress >= 80 ? "success" : progress >= 50 ? "info" : "warning"}
          animated={false}
        />

        <p className="text-xs text-muted-foreground">
          {sprint.projectName}
          {sprint.releaseName ? ` · ${sprint.releaseName}` : ""}
        </p>
      </CardContent>
    </Card>
  );
}

export { SprintCard };
