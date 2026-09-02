"use client";

import { cn } from "@/lib/utils";

import type { Release } from "../types/sprint.types";
import { ReleaseCard } from "./release-card";
import { SprintEmptyState } from "./sprint-empty-state";

export interface ReleaseTimelineProps {
  releases: Release[];
  layout?: "list" | "timeline";
  className?: string;
  onEdit?: (release: Release) => void;
}

function ReleaseTimeline({ releases, layout = "timeline", className, onEdit }: ReleaseTimelineProps) {
  if (releases.length === 0) {
    return <SprintEmptyState variant="no-releases" />;
  }

  if (layout === "list") {
    return (
      <div className={cn("grid gap-4 sm:grid-cols-2 lg:grid-cols-3", className)}>
        {releases.map((release) => (
          <ReleaseCard key={release.id} release={release} onEdit={onEdit} />
        ))}
      </div>
    );
  }

  return (
    <ol className={cn("relative flex flex-col gap-0", className)} data-slot="release-timeline">
      {releases.map((release, index) => (
        <li key={release.id} className="relative flex gap-4 pb-6 last:pb-0">
          {index < releases.length - 1 ? (
            <span
              className="absolute left-[7px] top-4 h-[calc(100%-8px)] w-px bg-border"
              aria-hidden
            />
          ) : null}
          <span
            className="relative z-10 mt-2 size-3.5 shrink-0 rounded-full border-2 border-primary bg-background"
            aria-hidden
          />
          <div className="min-w-0 flex-1">
            <ReleaseCard release={release} onEdit={onEdit} />
          </div>
        </li>
      ))}
    </ol>
  );
}

export { ReleaseTimeline };
