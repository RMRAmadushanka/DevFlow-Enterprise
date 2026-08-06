"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { routes } from "@/config/routes";

import { formatSprintRange } from "../utils/dates";
import type { Sprint } from "../types/sprint.types";
import { SprintStatusBadge } from "./sprint-status-badge";

export interface SprintTimelineProps {
  sprints: Sprint[];
  orientation?: "vertical" | "horizontal";
  className?: string;
}

function SprintTimeline({
  sprints,
  orientation = "vertical",
  className,
}: SprintTimelineProps) {
  if (sprints.length === 0) {
    return null;
  }

  if (orientation === "horizontal") {
    return (
      <div
        className={cn("flex gap-4 overflow-x-auto pb-2", className)}
        data-slot="sprint-timeline"
      >
        {sprints.map((sprint) => (
          <Link
            key={sprint.id}
            href={routes.app.sprint(sprint.id)}
            className="flex min-w-[200px] flex-col gap-2 rounded-lg border border-border bg-card p-3 transition-colors hover:border-ring/40"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-medium">{sprint.name}</span>
              <SprintStatusBadge status={sprint.status} size="sm" />
            </div>
            <span className="text-xs text-muted-foreground">
              {formatSprintRange(sprint.startDate, sprint.endDate)}
            </span>
          </Link>
        ))}
      </div>
    );
  }

  return (
    <ol className={cn("relative flex flex-col gap-0", className)} data-slot="sprint-timeline">
      {sprints.map((sprint, index) => (
        <li key={sprint.id} className="relative flex gap-4 pb-6 last:pb-0">
          {index < sprints.length - 1 ? (
            <span
              className="absolute left-[7px] top-4 h-[calc(100%-8px)] w-px bg-border"
              aria-hidden
            />
          ) : null}
          <span
            className={cn(
              "relative z-10 mt-1 size-3.5 shrink-0 rounded-full border-2",
              sprint.status === "active"
                ? "border-success bg-success"
                : sprint.status === "completed"
                  ? "border-primary bg-primary"
                  : "border-muted-foreground bg-background"
            )}
            aria-hidden
          />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href={routes.app.sprint(sprint.id)}
                className="text-sm font-medium outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring/50"
              >
                {sprint.name}
              </Link>
              <SprintStatusBadge status={sprint.status} size="sm" />
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {formatSprintRange(sprint.startDate, sprint.endDate)}
            </p>
            {sprint.goal ? (
              <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{sprint.goal}</p>
            ) : null}
          </div>
        </li>
      ))}
    </ol>
  );
}

export { SprintTimeline };
