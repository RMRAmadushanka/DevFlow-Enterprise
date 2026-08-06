"use client";

import { FolderKanban } from "lucide-react";

import { AppBreadcrumb, type AppBreadcrumbItem } from "@/components/layout/breadcrumbs/breadcrumb";

import type { Project } from "../types/project.types";
import { FavoriteProjectButton } from "./favorite-project-button";
import { ProjectHealthCard } from "./project-health-card";
import { ProjectQuickActions } from "./project-quick-actions";
import { ProjectStatusBadge } from "./project-status-badge";

export interface ProjectHeaderProps {
  project: Project;
  breadcrumbs?: AppBreadcrumbItem[];
  onArchive?: (project: Project) => void;
  onDuplicate?: (project: Project) => void;
  actions?: React.ReactNode;
}

function ProjectHeader({
  project,
  breadcrumbs,
  onArchive,
  onDuplicate,
  actions,
}: ProjectHeaderProps) {
  return (
    <div className="flex flex-col gap-4" data-slot="project-header">
      {breadcrumbs?.length ? <AppBreadcrumb items={breadcrumbs} /> : null}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <div
            className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border"
            style={{ backgroundColor: `${project.color}22` }}
          >
            {project.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={project.logoUrl} alt="" className="size-full object-cover" />
            ) : (
              <FolderKanban className="size-6" style={{ color: project.color }} aria-hidden />
            )}
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="truncate text-2xl font-semibold tracking-tight text-foreground">
                {project.name}
              </h1>
              <ProjectStatusBadge status={project.status} />
              <ProjectHealthCard health={project.health} compact />
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {project.key} · {project.visibility}
              {project.teamName ? ` · ${project.teamName}` : ""}
            </p>
            {project.description ? (
              <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{project.description}</p>
            ) : null}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <FavoriteProjectButton projectId={project.id} favorite={project.favorite} />
          <ProjectQuickActions
            project={project}
            onArchive={onArchive}
            onDuplicate={onDuplicate}
          />
          {actions}
        </div>
      </div>
    </div>
  );
}

export { ProjectHeader };
