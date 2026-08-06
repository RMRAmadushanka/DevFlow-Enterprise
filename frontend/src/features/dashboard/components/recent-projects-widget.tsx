"use client";

import * as React from "react";
import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";

import { DashboardTable, WidgetCard } from "@/components/dashboard";
import { StatusBadge } from "@/components/data-display/badges";
import { ProgressBar } from "@/components/data-display/progress";
import { formatRelativeTime } from "@/components/data-display/shared/formatters";
import type { Tone } from "@/components/data-display/shared/types";
import { Button } from "@/components/ui/button";
import { routes } from "@/config/routes";

import { useDashboardProjects } from "../hooks/use-dashboard-metrics";
import type { DashboardProject, ProjectStatus } from "../types/dashboard.types";

const STATUS_TONE: Record<ProjectStatus, Tone> = {
  active: "success",
  completed: "info",
  paused: "warning",
  archived: "neutral",
};

const RecentProjectsWidget = React.memo(function RecentProjectsWidget() {
  const { data = [], isLoading, isError, refetch } = useDashboardProjects();
  const recent = data.slice(0, 5);

  const columns = React.useMemo<ColumnDef<DashboardProject>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Project",
        cell: ({ row }) => (
          <Link
            href={routes.app.project(row.original.id)}
            className="font-medium hover:underline"
          >
            {row.original.name}
          </Link>
        ),
      },
      { accessorKey: "owner", header: "Owner" },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <StatusBadge tone={STATUS_TONE[row.original.status]} size="sm">
            {row.original.status}
          </StatusBadge>
        ),
      },
      {
        accessorKey: "progress",
        header: "Progress",
        cell: ({ row }) => (
          <div className="min-w-24">
            <ProgressBar value={row.original.progress} label={`${row.original.progress}%`} />
          </div>
        ),
      },
      {
        accessorKey: "updatedAt",
        header: "Updated",
        cell: ({ getValue }) => formatRelativeTime(String(getValue())),
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <Button
            render={<Link href={routes.app.project(row.original.id)} />}
            size="sm"
            variant="outline"
          >
            Open
          </Button>
        ),
      },
    ],
    []
  );

  return (
    <>
      <div className="hidden md:block">
        <DashboardTable
          title="Recent projects"
          description="Latest updates across your portfolio"
          columns={columns}
          data={recent}
          getRowId={(row) => row.id}
          loading={isLoading}
          empty={!isLoading && !isError && recent.length === 0}
          error={isError ? "Could not load recent projects" : undefined}
          onRetry={() => void refetch()}
          enablePagination={false}
          noun="projects"
        />
      </div>
      <div className="md:hidden">
        <WidgetCard
          title="Recent projects"
          loading={isLoading}
          empty={!isLoading && !isError && recent.length === 0}
          error={isError ? "Could not load recent projects" : undefined}
          onRetry={() => void refetch()}
        >
          <div className="flex flex-col gap-3">
            {recent.map((project) => (
              <article key={project.id} className="rounded-lg border border-border p-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium">{project.name}</p>
                    <p className="text-xs text-muted-foreground">{project.owner}</p>
                  </div>
                  <StatusBadge tone={STATUS_TONE[project.status]} size="sm">
                    {project.status}
                  </StatusBadge>
                </div>
                <div className="mt-3">
                  <ProgressBar value={project.progress} label={`${project.progress}%`} />
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {formatRelativeTime(project.updatedAt)}
                  </span>
                  <Button
                    render={<Link href={routes.app.project(project.id)} />}
                    size="sm"
                    variant="outline"
                  >
                    Open
                  </Button>
                </div>
              </article>
            ))}
          </div>
        </WidgetCard>
      </div>
    </>
  );
});

export { RecentProjectsWidget };
