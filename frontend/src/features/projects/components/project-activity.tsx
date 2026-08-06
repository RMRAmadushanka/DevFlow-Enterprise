"use client";

import { formatRelativeTime } from "@/components/data-display/shared/formatters";

import type { ProjectActivityItem } from "../types/project.types";
import { ProjectEmptyState } from "./project-empty-state";

export interface ProjectActivityProps {
  items: ProjectActivityItem[];
  limit?: number;
  className?: string;
}

function ProjectActivity({ items, limit, className }: ProjectActivityProps) {
  const visible = limit ? items.slice(0, limit) : items;

  if (visible.length === 0) {
    return <ProjectEmptyState variant="no-activity" />;
  }

  return (
    <ul className={className} aria-label="Recent project activity" data-slot="project-activity">
      {visible.map((item) => (
        <li
          key={item.id}
          className="flex flex-col gap-0.5 border-b border-border py-3 last:border-b-0 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="min-w-0 text-sm text-foreground">
            <span className="font-medium">{item.actorName}</span> {item.summary}
            {item.meta ? (
              <span className="mt-0.5 block text-xs text-muted-foreground">{item.meta}</span>
            ) : null}
          </div>
          <time className="shrink-0 text-xs text-muted-foreground" dateTime={item.timestamp}>
            {formatRelativeTime(item.timestamp)}
          </time>
        </li>
      ))}
    </ul>
  );
}

export { ProjectActivity };
