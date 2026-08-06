"use client";

import * as React from "react";
import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import { FolderKanban } from "lucide-react";

import { ProgressBar } from "@/components/data-display/progress";
import { formatRelativeTime } from "@/components/data-display/shared/formatters";
import { DataTable } from "@/components/data-display/table";
import { routes } from "@/config/routes";

import type { Project } from "../types/project.types";
import { FavoriteProjectButton } from "./favorite-project-button";
import { ProjectEmptyState } from "./project-empty-state";
import { ProjectHealthCard } from "./project-health-card";
import { ProjectQuickActions } from "./project-quick-actions";
import { ProjectStatusBadge } from "./project-status-badge";
import { ProjectTableSkeleton } from "./project-skeleton";

export interface ProjectTableProps {
  projects: Project[];
  loading?: boolean;
  emptyVariant?: "no-projects" | "no-results";
  onArchive?: (project: Project) => void;
  onDuplicate?: (project: Project) => void;
}

function ProjectTable({
  projects,
  loading,
  emptyVariant = "no-projects",
  onArchive,
  onDuplicate,
}: ProjectTableProps) {
  const columns = React.useMemo<ColumnDef<Project>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Project",
        cell: ({ row }) => {
          const project = row.original;
          return (
            <div className="flex min-w-0 items-center gap-3">
              <div
                className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-border"
                style={{ backgroundColor: `${project.color}22` }}
              >
                <FolderKanban className="size-4" style={{ color: project.color }} aria-hidden />
              </div>
              <div className="min-w-0">
                <Link
                  href={routes.app.project(project.id)}
                  className="truncate font-medium text-foreground outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring/50"
                >
                  {project.name}
                </Link>
                <p className="truncate text-xs text-muted-foreground">{project.key}</p>
              </div>
              <FavoriteProjectButton projectId={project.id} favorite={project.favorite} />
            </div>
          );
        },
      },
      {
        accessorKey: "ownerName",
        header: "Owner",
        cell: ({ getValue }) => (
          <span className="text-sm text-foreground">{String(getValue())}</span>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <ProjectStatusBadge status={row.original.status} />,
      },
      {
        accessorKey: "health",
        header: "Health",
        cell: ({ row }) => <ProjectHealthCard health={row.original.health} compact />,
      },
      {
        accessorKey: "memberCount",
        header: "Members",
        cell: ({ getValue }) => (
          <span className="tabular-nums text-sm">{Number(getValue())}</span>
        ),
      },
      {
        id: "repository",
        header: "Repository",
        cell: ({ row }) =>
          row.original.repositoryUrl ? (
            <a
              href={row.original.repositoryUrl}
              target="_blank"
              rel="noreferrer"
              className="truncate text-sm text-primary outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring/50"
            >
              {row.original.defaultBranch}
            </a>
          ) : (
            <span className="text-sm text-muted-foreground">—</span>
          ),
      },
      {
        id: "tasks",
        header: "Tasks",
        cell: ({ row }) => (
          <span className="tabular-nums text-sm">
            {row.original.completedTaskCount}/{row.original.taskCount}
          </span>
        ),
      },
      {
        accessorKey: "progress",
        header: "Completion",
        cell: ({ row }) => (
          <div className="w-28 space-y-1">
            <ProgressBar
              value={row.original.progress}
              size="sm"
              showValue={false}
              animated={false}
            />
            <p className="text-xs tabular-nums text-muted-foreground">
              {row.original.progress}%
            </p>
          </div>
        ),
      },
      {
        accessorKey: "updatedAt",
        header: "Last updated",
        cell: ({ getValue }) => (
          <span className="text-sm text-muted-foreground">
            {formatRelativeTime(String(getValue()))}
          </span>
        ),
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <ProjectQuickActions
            project={row.original}
            onArchive={onArchive}
            onDuplicate={onDuplicate}
          />
        ),
      },
    ],
    [onArchive, onDuplicate]
  );

  if (loading) return <ProjectTableSkeleton />;
  if (projects.length === 0) return <ProjectEmptyState variant={emptyVariant} />;

  return (
    <DataTable
      columns={columns}
      data={projects}
      getRowId={(row) => row.id}
      enablePagination={projects.length > 10}
      density="comfortable"
    />
  );
}

export { ProjectTable };
