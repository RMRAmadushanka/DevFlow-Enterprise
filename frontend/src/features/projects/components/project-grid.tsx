"use client";

import type { Project } from "../types/project.types";
import { ProjectCard } from "./project-card";
import { ProjectEmptyState } from "./project-empty-state";
import { ProjectGridSkeleton } from "./project-skeleton";

export interface ProjectGridProps {
  projects: Project[];
  loading?: boolean;
  compact?: boolean;
  emptyVariant?: "no-projects" | "no-results";
  onArchive?: (project: Project) => void;
  onDuplicate?: (project: Project) => void;
}

function ProjectGrid({
  projects,
  loading,
  compact,
  emptyVariant = "no-projects",
  onArchive,
  onDuplicate,
}: ProjectGridProps) {
  if (loading) return <ProjectGridSkeleton />;
  if (projects.length === 0) return <ProjectEmptyState variant={emptyVariant} />;

  return (
    <div
      className={
        compact
          ? "grid gap-3 sm:grid-cols-2 xl:grid-cols-3"
          : "grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
      }
      data-slot="project-grid"
    >
      {projects.map((project) => (
        <ProjectCard
          key={project.id}
          project={project}
          compact={compact}
          onArchive={onArchive}
          onDuplicate={onDuplicate}
        />
      ))}
    </div>
  );
}

export { ProjectGrid };
