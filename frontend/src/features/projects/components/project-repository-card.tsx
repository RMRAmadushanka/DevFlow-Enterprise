"use client";

import { ExternalLink, GitBranch, GitCommit, GitPullRequest } from "lucide-react";

import { formatRelativeTime } from "@/components/data-display/shared/formatters";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import type { ProjectRepository } from "../types/project.types";
import { ProjectHealthCard } from "./project-health-card";
import { ProjectEmptyState } from "./project-empty-state";

export interface ProjectRepositoryCardProps {
  repository?: ProjectRepository;
  repositoryUrl?: string;
  compact?: boolean;
  className?: string;
}

function ProjectRepositoryCard({
  repository,
  repositoryUrl,
  compact,
  className,
}: ProjectRepositoryCardProps) {
  if (!repository) {
    return <ProjectEmptyState variant="no-repository" />;
  }

  const href = repositoryUrl ?? repository.url;

  return (
    <article
      className={cn(
        "rounded-xl border border-border bg-card",
        compact ? "p-4" : "p-5",
        className
      )}
      data-slot="project-repository-card"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">Repository</p>
          <a
            href={href}
            target="_blank"
            rel="noreferrer"
            className="mt-1 inline-flex max-w-full items-center gap-1.5 truncate text-sm font-medium text-primary outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring/50"
          >
            {repository.url}
            <ExternalLink className="size-3.5 shrink-0" aria-hidden />
          </a>
        </div>
        <ProjectHealthCard health={repository.health} compact />
      </div>

      <dl className={cn("mt-4 grid gap-3", compact ? "grid-cols-2" : "sm:grid-cols-2")}>
        <div>
          <dt className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <GitBranch className="size-3.5" aria-hidden />
            Default branch
          </dt>
          <dd className="mt-0.5 text-sm font-medium text-foreground">{repository.defaultBranch}</dd>
        </div>
        <div>
          <dt className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <GitPullRequest className="size-3.5" aria-hidden />
            Open PRs
          </dt>
          <dd className="mt-0.5 text-sm font-medium text-foreground">{repository.openPullRequests}</dd>
        </div>
        <div className="col-span-full">
          <dt className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <GitCommit className="size-3.5" aria-hidden />
            Latest commit
          </dt>
          <dd className="mt-0.5 text-sm text-foreground">
            <span className="font-mono text-xs">{repository.latestCommit.slice(0, 7)}</span>
            {" · "}
            {repository.latestCommitMessage}
          </dd>
        </div>
        {repository.latestRelease ? (
          <div>
            <dt className="text-xs text-muted-foreground">Latest release</dt>
            <dd className="mt-0.5 text-sm font-medium text-foreground">{repository.latestRelease}</dd>
          </div>
        ) : null}
        <div>
          <dt className="text-xs text-muted-foreground">Branches</dt>
          <dd className="mt-0.5 text-sm font-medium text-foreground">{repository.branchCount}</dd>
        </div>
      </dl>

      {!compact ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-4"
          render={<a href={href} target="_blank" rel="noreferrer" />}
        >
          Open repository
        </Button>
      ) : null}
    </article>
  );
}

export { ProjectRepositoryCard };
