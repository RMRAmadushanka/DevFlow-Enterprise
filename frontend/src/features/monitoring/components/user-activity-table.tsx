"use client";

import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";

import { DataTable } from "@/components/data-display/table";

import type { UserActivityRow } from "../types/monitoring.types";
import { formatTimestamp } from "../utils/format";
import { MonitoringEmptyState } from "./monitoring-empty-state";
import { TableSkeleton } from "./monitoring-skeleton";

export interface UserActivityTableProps {
  rows: UserActivityRow[];
  loading?: boolean;
}

function UserActivityTable({ rows, loading }: UserActivityTableProps) {
  const columns = React.useMemo<ColumnDef<UserActivityRow>[]>(
    () => [
      {
        accessorKey: "userName",
        header: "User",
        cell: ({ row }) => (
          <span className="font-medium text-foreground">{row.original.userName}</span>
        ),
      },
      {
        accessorKey: "logins",
        header: "Logins",
        cell: ({ row }) => (
          <span className="tabular-nums">{row.original.logins}</span>
        ),
      },
      {
        accessorKey: "projectActions",
        header: "Projects",
        cell: ({ row }) => (
          <span className="tabular-nums">{row.original.projectActions}</span>
        ),
      },
      {
        accessorKey: "taskActions",
        header: "Tasks",
        cell: ({ row }) => (
          <span className="tabular-nums">{row.original.taskActions}</span>
        ),
      },
      {
        accessorKey: "deploymentActions",
        header: "Deploys",
        cell: ({ row }) => (
          <span className="tabular-nums">{row.original.deploymentActions}</span>
        ),
      },
      {
        accessorKey: "documentActions",
        header: "Docs",
        cell: ({ row }) => (
          <span className="tabular-nums">{row.original.documentActions}</span>
        ),
      },
      {
        accessorKey: "lastActiveAt",
        header: "Last active",
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {formatTimestamp(row.original.lastActiveAt)}
          </span>
        ),
      },
    ],
    []
  );

  if (loading) return <TableSkeleton />;
  if (rows.length === 0) {
    return <MonitoringEmptyState variant="no-data" />;
  }

  return <DataTable columns={columns} data={rows} />;
}

export { UserActivityTable };
