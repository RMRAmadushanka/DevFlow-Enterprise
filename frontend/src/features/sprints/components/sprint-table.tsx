"use client";

import * as React from "react";
import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";

import { ProgressBar } from "@/components/data-display/progress";
import { DataTable } from "@/components/data-display/table";
import { routes } from "@/config/routes";

import { completionPercent, formatSprintRange } from "../utils/dates";
import type { Sprint } from "../types/sprint.types";
import { SprintEmptyState } from "./sprint-empty-state";
import { SprintQuickActions } from "./sprint-quick-actions";
import { SprintHealthBadge, SprintStatusBadge } from "./sprint-status-badge";
import { SprintTableSkeleton } from "./sprint-skeleton";

export interface SprintTableProps {
  sprints: Sprint[];
  loading?: boolean;
  emptyVariant?: "no-sprint" | "no-results";
  onComplete?: (sprint: Sprint) => void;
  onArchive?: (sprint: Sprint) => void;
}

function SprintTable({
  sprints,
  loading,
  emptyVariant = "no-sprint",
  onComplete,
  onArchive,
}: SprintTableProps) {
  const columns = React.useMemo<ColumnDef<Sprint>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Sprint",
        cell: ({ row }) => (
          <Link
            href={routes.app.sprint(row.original.id)}
            className="font-medium text-foreground outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring/50"
          >
            {row.original.name}
          </Link>
        ),
      },
      {
        accessorKey: "projectName",
        header: "Project",
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <SprintStatusBadge status={row.original.status} size="sm" />,
      },
      {
        id: "dates",
        header: "Dates",
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {formatSprintRange(row.original.startDate, row.original.endDate)}
          </span>
        ),
      },
      {
        id: "progress",
        header: "Progress",
        cell: ({ row }) => {
          const pct = completionPercent(
            row.original.completedPoints,
            row.original.committedPoints
          );
          return (
            <ProgressBar value={pct} showValue animated={false} size="sm" className="min-w-[100px]" />
          );
        },
      },
      {
        accessorKey: "velocity",
        header: "Velocity",
        cell: ({ getValue }) => (
          <span className="tabular-nums text-sm">{String(getValue() ?? 0)}</span>
        ),
      },
      {
        id: "health",
        header: "Health",
        cell: ({ row }) => <SprintHealthBadge health={row.original.health} />,
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <SprintQuickActions
            sprint={row.original}
            onComplete={onComplete}
            onArchive={onArchive}
            compact
          />
        ),
      },
    ],
    [onArchive, onComplete]
  );

  if (loading) {
    return <SprintTableSkeleton />;
  }

  if (sprints.length === 0) {
    return <SprintEmptyState variant={emptyVariant} />;
  }

  return (
    <DataTable
      columns={columns}
      data={sprints}
      getRowId={(row) => row.id}
      enablePagination={sprints.length > 10}
    />
  );
}

export { SprintTable };
