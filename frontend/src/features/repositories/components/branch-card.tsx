"use client";

import { GitBranch } from "lucide-react";

import { StatusBadge } from "@/components/data-display/badges";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

import type { Branch } from "../types/repository.types";
import { formatRelativeCommitDate } from "../utils/format";

export interface BranchCardProps {
  branch: Branch;
  selected?: boolean;
  onSelect?: (branch: Branch) => void;
  className?: string;
}

function BranchCard({ branch, selected, onSelect, className }: BranchCardProps) {
  return (
    <Card
      data-slot="branch-card"
      className={cn(
        "transition-colors hover:border-ring/40",
        selected && "border-ring ring-1 ring-ring/40",
        onSelect && "cursor-pointer",
        className
      )}
      onClick={() => onSelect?.(branch)}
    >
      <CardContent className="flex flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <GitBranch className="size-4 shrink-0 text-muted-foreground" aria-hidden />
            <span className="truncate font-medium text-foreground">{branch.name}</span>
          </div>
          <div className="flex flex-wrap items-center gap-1">
            {branch.isDefault ? (
              <StatusBadge tone="info" size="sm">
                Default
              </StatusBadge>
            ) : null}
            {branch.protected ? (
              <StatusBadge tone="warning" size="sm">
                Protected
              </StatusBadge>
            ) : null}
          </div>
        </div>
        <p className="line-clamp-1 text-sm text-muted-foreground">
          {branch.lastCommitMessage || "No commits"}
        </p>
        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <span className="font-mono">{branch.lastCommitSha?.slice(0, 7)}</span>
          {branch.ahead > 0 || branch.behind > 0 ? (
            <span>
              ↑{branch.ahead} ↓{branch.behind}
            </span>
          ) : null}
          {branch.updatedAt ? (
            <time dateTime={branch.updatedAt}>
              {formatRelativeCommitDate(branch.updatedAt)}
            </time>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}

export { BranchCard };
