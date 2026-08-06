"use client";

import { cn } from "@/lib/utils";

import type { Commit } from "../types/repository.types";
import { CommitCard } from "./commit-card";
import { RepositoryEmptyState } from "./repository-empty-state";

export interface CommitTimelineProps {
  commits: Commit[];
  onSelect?: (commit: Commit) => void;
  className?: string;
}

function CommitTimeline({ commits, onSelect, className }: CommitTimelineProps) {
  if (commits.length === 0) {
    return <RepositoryEmptyState variant="no-commits" />;
  }

  return (
    <ol className={cn("relative flex flex-col", className)} data-slot="commit-timeline">
      {commits.map((commit, index) => (
        <li key={commit.id} className="relative flex gap-4 pb-4 last:pb-0">
          {index < commits.length - 1 ? (
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
            <CommitCard commit={commit} onSelect={onSelect} />
          </div>
        </li>
      ))}
    </ol>
  );
}

export { CommitTimeline };
