"use client";

import { GitPullRequest } from "lucide-react";

import { StatusBadge } from "@/components/data-display/badges";
import { UserAvatar, UserAvatarGroup } from "@/components/data-display/avatars";
import type { Tone } from "@/components/data-display/shared/types";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

import type { PullRequest, PullRequestStatus } from "../types/repository.types";
import { formatRelativeCommitDate } from "../utils/format";

const PR_TONE: Record<PullRequestStatus, Tone> = {
  open: "success",
  draft: "neutral",
  merged: "info",
  closed: "danger",
};

const PR_LABELS: Record<PullRequestStatus, string> = {
  open: "Open",
  draft: "Draft",
  merged: "Merged",
  closed: "Closed",
};

export interface PullRequestCardProps {
  pullRequest: PullRequest;
  onSelect?: (pullRequest: PullRequest) => void;
  className?: string;
}

function PullRequestCard({
  pullRequest,
  onSelect,
  className,
}: PullRequestCardProps) {
  return (
    <Card
      data-slot="pull-request-card"
      className={cn(
        "transition-colors hover:border-ring/40",
        onSelect && "cursor-pointer",
        className
      )}
      onClick={() => onSelect?.(pullRequest)}
    >
      <CardContent className="flex flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <GitPullRequest className="size-4 shrink-0 text-muted-foreground" aria-hidden />
              <h3 className="truncate text-base font-semibold text-foreground">
                {pullRequest.title}
              </h3>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              #{pullRequest.number} · {pullRequest.sourceBranch} → {pullRequest.targetBranch}
            </p>
          </div>
          <StatusBadge tone={PR_TONE[pullRequest.status]} size="sm" dot>
            {PR_LABELS[pullRequest.status]}
          </StatusBadge>
        </div>

        {pullRequest.description ? (
          <p className="line-clamp-2 text-sm text-muted-foreground">
            {pullRequest.description}
          </p>
        ) : null}

        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <UserAvatar
              user={{
                id: pullRequest.author.id,
                name: pullRequest.author.name,
                imageUrl: pullRequest.author.avatarUrl,
              }}
              size="sm"
            />
            {pullRequest.author.name}
          </span>
          <span>{pullRequest.commentCount} comments</span>
          <span>
            Checks {pullRequest.checksPassing}/{pullRequest.checksTotal}
          </span>
          <time dateTime={pullRequest.updatedAt}>
            {formatRelativeCommitDate(pullRequest.updatedAt)}
          </time>
        </div>

        {pullRequest.labels.length > 0 ? (
          <ul className="flex flex-wrap gap-1">
            {pullRequest.labels.map((label) => (
              <li
                key={label}
                className="rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground"
              >
                {label}
              </li>
            ))}
          </ul>
        ) : null}

        {pullRequest.reviewers.length > 0 ? (
          <UserAvatarGroup
            users={pullRequest.reviewers.map((r) => ({
              id: r.id,
              name: r.name,
              imageUrl: r.avatarUrl,
            }))}
            max={4}
            size="sm"
          />
        ) : null}
      </CardContent>
    </Card>
  );
}

export { PullRequestCard };
