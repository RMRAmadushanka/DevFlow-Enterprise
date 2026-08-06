"use client";

import { UserAvatar } from "@/components/data-display/avatars";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

import type { Commit } from "../types/repository.types";
import { formatRelativeCommitDate } from "../utils/format";

export interface CommitCardProps {
  commit: Commit;
  onSelect?: (commit: Commit) => void;
  className?: string;
}

function CommitCard({ commit, onSelect, className }: CommitCardProps) {
  return (
    <Card
      data-slot="commit-card"
      className={cn(
        "transition-colors hover:border-ring/40",
        onSelect && "cursor-pointer",
        className
      )}
      onClick={() => onSelect?.(commit)}
    >
      <CardContent className="flex gap-3 p-4">
        <UserAvatar
          user={{
            id: commit.authorId,
            name: commit.authorName,
            imageUrl: commit.authorAvatarUrl,
          }}
          size="sm"
        />
        <div className="min-w-0 flex-1 space-y-1">
          <p className="line-clamp-2 text-sm font-medium text-foreground">
            {commit.message}
          </p>
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span>{commit.authorName}</span>
            <span className="font-mono">{commit.shortSha || commit.sha.slice(0, 7)}</span>
            <span>{commit.branch}</span>
            <time dateTime={commit.committedAt}>
              {formatRelativeCommitDate(commit.committedAt)}
            </time>
            <span className="text-success">+{commit.additions}</span>
            <span className="text-danger">−{commit.deletions}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export { CommitCard };
