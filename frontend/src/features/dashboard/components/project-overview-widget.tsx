"use client";

import * as React from "react";
import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import { LayoutGrid, List, MoreHorizontal } from "lucide-react";

import { DashboardTable, WidgetCard } from "@/components/dashboard";
import { StatusBadge } from "@/components/data-display/badges";
import { ProgressBar } from "@/components/data-display/progress";
import { formatRelativeTime } from "@/components/data-display/shared/formatters";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { routes } from "@/config/routes";
import type { Tone } from "@/components/data-display/shared/types";

import { useDashboardProjects } from "../hooks/use-dashboard-metrics";
import { useDashboardPreferences } from "../hooks/use-dashboard-preferences";
import type { DashboardProject, ProjectStatus } from "../types/dashboard.types";

const STATUS_TONE: Record<ProjectStatus, Tone> = {
  active: "success",
  completed: "info",
  paused: "warning",
  archived: "neutral",
};

const ProjectOverviewWidget = React.memo(function ProjectOverviewWidget() {
  const { data = [], isLoading, isError, refetch } = useDashboardProjects();
  const { projectViewMode, setProjectViewMode } = useDashboardPreferences();

  const columns = React.useMemo<ColumnDef<DashboardProject>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Project",
        cell: ({ row }) => (
          <Link
            href={routes.app.project(row.original.id)}
            className="font-medium text-foreground hover:underline"
          >
            {row.original.name}
          </Link>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <StatusBadge tone={STATUS_TONE[row.original.status]} size="sm" dot>
            {row.original.status}
          </StatusBadge>
        ),
      },
      {
        accessorKey: "progress",
        header: "Progress",
        cell: ({ row }) => (
          <div className="min-w-28">
            <ProgressBar value={row.original.progress} label={`${row.original.progress}%`} />
          </div>
        ),
      },
      {
        accessorKey: "memberCount",
        header: "Members",
      },
      {
        accessorKey: "lastActivityAt",
        header: "Last activity",
        cell: ({ getValue }) => formatRelativeTime(String(getValue())),
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  type="button"
                  size="icon-sm"
                  variant="ghost"
                  aria-label={`Actions for ${row.original.name}`}
                />
              }
            >
              <MoreHorizontal className="size-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem render={<Link href={routes.app.project(row.original.id)} />}>
                Open
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    []
  );

  const viewToggle = (
    <div role="group" aria-label="Project view mode" className="flex gap-1">
      <Button
        type="button"
        size="icon-sm"
        variant={projectViewMode === "table" ? "secondary" : "ghost"}
        aria-pressed={projectViewMode === "table"}
        aria-label="Table view"
        onClick={() => setProjectViewMode("table")}
      >
        <List className="size-4" />
      </Button>
      <Button
        type="button"
        size="icon-sm"
        variant={projectViewMode === "cards" ? "secondary" : "ghost"}
        aria-pressed={projectViewMode === "cards"}
        aria-label="Card view"
        onClick={() => setProjectViewMode("cards")}
      >
        <LayoutGrid className="size-4" />
      </Button>
    </div>
  );

  if (projectViewMode === "cards") {
    return (
      <WidgetCard
        title="Project overview"
        description="Top projects in the current filter"
        actions={viewToggle}
        loading={isLoading}
        empty={!isLoading && !isError && data.length === 0}
        error={isError ? "Could not load projects" : undefined}
        onRetry={() => void refetch()}
      >
        <div className="grid gap-3 sm:grid-cols-2">
          {data.map((project) => (
            <article
              key={project.id}
              className="flex flex-col gap-3 rounded-lg border border-border p-3 transition-colors hover:border-ring/40"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <Link
                    href={routes.app.project(project.id)}
                    className="font-medium hover:underline"
                  >
                    {project.name}
                  </Link>
                  <p className="text-xs text-muted-foreground">{project.owner}</p>
                </div>
                <StatusBadge tone={STATUS_TONE[project.status]} size="sm">
                  {project.status}
                </StatusBadge>
              </div>
              <ProgressBar value={project.progress} label={`${project.progress}%`} />
              <p className="text-xs text-muted-foreground">
                {project.memberCount} members · {formatRelativeTime(project.lastActivityAt)}
              </p>
            </article>
          ))}
        </div>
      </WidgetCard>
    );
  }

  return (
    <DashboardTable
      title="Project overview"
      description="Top projects in the current filter"
      actions={viewToggle}
      columns={columns}
      data={data}
      getRowId={(row) => row.id}
      loading={isLoading}
      empty={!isLoading && !isError && data.length === 0}
      error={isError ? "Could not load projects" : undefined}
      onRetry={() => void refetch()}
      enablePagination={false}
      noun="projects"
    />
  );
});

export { ProjectOverviewWidget };
