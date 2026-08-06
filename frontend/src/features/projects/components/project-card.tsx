"use client";

import Link from "next/link";
import { FolderKanban, GitBranch, Users } from "lucide-react";

import { ProgressBar } from "@/components/data-display/progress";
import { formatRelativeTime } from "@/components/data-display/shared/formatters";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { routes } from "@/config/routes";
import { cn } from "@/lib/utils";

import type { Project } from "../types/project.types";
import { FavoriteProjectButton } from "./favorite-project-button";
import { ProjectHealthCard } from "./project-health-card";
import { ProjectQuickActions } from "./project-quick-actions";
import { ProjectStatusBadge } from "./project-status-badge";

export interface ProjectCardProps {
  project: Project;
  compact?: boolean;
  onArchive?: (project: Project) => void;
  onDuplicate?: (project: Project) => void;
  className?: string;
}

function ProjectCard({
  project,
  compact,
  onArchive,
  onDuplicate,
  className,
}: ProjectCardProps) {
  return (
    <article
      className={cn(
        "flex flex-col gap-4 rounded-xl border border-border bg-card p-5 transition-colors hover:border-ring/40",
        compact && "gap-3 p-4",
        className
      )}
      data-slot="project-card"
    >
      <div className="flex items-start gap-3">
        <div
          className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border"
          style={{ backgroundColor: `${project.color}22` }}
        >
          {project.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={project.logoUrl} alt="" className="size-full object-cover" />
          ) : (
            <FolderKanban className="size-5" style={{ color: project.color }} aria-hidden />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <Link
                href={routes.app.project(project.id)}
                className="truncate text-base font-semibold text-foreground outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring/50"
              >
                {project.name}
              </Link>
              <p className="truncate text-xs text-muted-foreground">
                {project.key} · {project.visibility}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-0.5">
              <FavoriteProjectButton projectId={project.id} favorite={project.favorite} />
              <ProjectQuickActions
                project={project}
                onArchive={onArchive}
                onDuplicate={onDuplicate}
                compact
              />
            </div>
          </div>
          {!compact ? (
            <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
              {project.description || "No description"}
            </p>
          ) : null}
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Progress</span>
          <span className="tabular-nums">{project.progress}%</span>
        </div>
        <ProgressBar value={project.progress} label="Progress" showValue={false} />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <ProjectStatusBadge status={project.status} />
        <ProjectHealthCard health={project.health} compact />
        {project.tags.slice(0, 3).map((tag) => (
          <Badge key={tag} variant="outline" className="text-[0.6875rem]">
            {tag}
          </Badge>
        ))}
      </div>

      <div className="mt-auto flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <Users className="size-3.5" aria-hidden />
          {project.memberCount}
        </span>
        {project.repositoryUrl ? (
          <span className="inline-flex min-w-0 items-center gap-1 truncate">
            <GitBranch className="size-3.5 shrink-0" aria-hidden />
            <span className="truncate">{project.defaultBranch}</span>
          </span>
        ) : null}
        <span className="ml-auto">Updated {formatRelativeTime(project.updatedAt)}</span>
      </div>

      <Button render={<Link href={routes.app.project(project.id)} />} variant="outline" size="sm">
        Open project
      </Button>
    </article>
  );
}

export { ProjectCard };
