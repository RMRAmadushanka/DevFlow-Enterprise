"use client";

import Link from "next/link";
import {
  CircleDot,
  GitBranch,
  GitCommitHorizontal,
  GitPullRequest,
  Star,
  Users,
} from "lucide-react";

import { StatusBadge } from "@/components/data-display/badges";
import { UserAvatarGroup } from "@/components/data-display/avatars";
import type { Tone } from "@/components/data-display/shared/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { routes } from "@/config/routes";

import {
  HEALTH_LABELS,
  PROVIDER_LABELS,
  VISIBILITY_LABELS,
} from "../constants/repository.constants";
import { useToggleRepositoryFavorite } from "../hooks/use-repositories";
import type {
  Repository as RepositoryEntity,
  RepositoryHealth,
} from "../types/repository.types";
import { formatRelativeCommitDate, formatRepoSize } from "../utils/format";
import { RepositoryQuickActions } from "./repository-quick-actions";

const HEALTH_TONE: Record<RepositoryHealth, Tone> = {
  healthy: "success",
  at_risk: "warning",
  critical: "danger",
  unknown: "neutral",
};

export interface RepositoryCardProps {
  repository: RepositoryEntity;
  onArchive?: (repository: RepositoryEntity) => void;
  onTransfer?: (repository: RepositoryEntity) => void;
  onDelete?: (repository: RepositoryEntity) => void;
  className?: string;
}

function RepositoryCard({
  repository,
  onArchive,
  onTransfer,
  onDelete,
  className,
}: RepositoryCardProps) {
  const favorite = useToggleRepositoryFavorite();

  return (
    <Card
      data-slot="repository-card"
      className={cn("transition-colors hover:border-ring/40", className)}
    >
      <CardContent className="flex flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <Link
                href={routes.app.repository(repository.id)}
                className="truncate text-base font-semibold text-foreground outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring/50"
              >
                {repository.name}
              </Link>
              <Button
                type="button"
                size="icon-sm"
                variant="ghost"
                aria-label={repository.favorited ? "Remove favorite" : "Add favorite"}
                aria-pressed={repository.favorited}
                onClick={() => void favorite.mutateAsync(repository.id)}
              >
                <Star
                  className={cn(
                    "size-4",
                    repository.favorited && "fill-warning text-warning"
                  )}
                />
              </Button>
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {repository.organization}
              {repository.projectName ? ` · ${repository.projectName}` : ""}
            </p>
            {repository.description ? (
              <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                {repository.description}
              </p>
            ) : null}
          </div>
          <RepositoryQuickActions
            repository={repository}
            onArchive={onArchive}
            onTransfer={onTransfer}
            onDelete={onDelete}
            compact
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge tone="neutral" size="sm" dot>
            {VISIBILITY_LABELS[repository.visibility]}
          </StatusBadge>
          <StatusBadge tone={HEALTH_TONE[repository.health]} size="sm" dot>
            {HEALTH_LABELS[repository.health]}
          </StatusBadge>
          {repository.archived ? (
            <StatusBadge tone="warning" size="sm">
              Archived
            </StatusBadge>
          ) : null}
          <StatusBadge tone="info" size="sm">
            {PROVIDER_LABELS[repository.provider]}
          </StatusBadge>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <GitBranch className="size-3.5" aria-hidden />
            {repository.defaultBranch}
          </span>
          {repository.primaryLanguage ? (
            <span>{repository.primaryLanguage}</span>
          ) : null}
          <span>{formatRepoSize(repository.sizeKb)}</span>
          <span className="inline-flex items-center gap-1">
            <GitPullRequest className="size-3.5" aria-hidden />
            {repository.openPullRequests} PRs
          </span>
          <span className="inline-flex items-center gap-1">
            <CircleDot className="size-3.5" aria-hidden />
            {repository.openIssues} issues
          </span>
          <span className="inline-flex items-center gap-1">
            <Users className="size-3.5" aria-hidden />
            {repository.contributorCount}
          </span>
        </div>

        <div className="flex items-start gap-2 text-xs text-muted-foreground">
          <GitCommitHorizontal className="mt-0.5 size-3.5 shrink-0" aria-hidden />
          <div className="min-w-0">
            <p className="line-clamp-1">{repository.lastCommitMessage || "No commits yet"}</p>
            {repository.lastCommitAt ? (
              <p className="mt-0.5">
                {repository.lastCommitAuthor} · {formatRelativeCommitDate(repository.lastCommitAt)}
              </p>
            ) : null}
          </div>
        </div>

        {repository.contributorCount > 0 ? (
          <UserAvatarGroup
            users={Array.from({ length: Math.min(repository.contributorCount, 4) }, (_, i) => ({
              id: `${repository.id}-c-${i}`,
              name: `Contributor ${i + 1}`,
            }))}
            max={4}
            size="sm"
          />
        ) : null}
      </CardContent>
    </Card>
  );
}

export { RepositoryCard };
