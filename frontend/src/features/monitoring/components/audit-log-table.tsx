"use client";

import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";

import { StatusBadge } from "@/components/data-display/badges";
import { DataTable } from "@/components/data-display/table";

import type { AuditLogEntry } from "../types/monitoring.types";
import { formatTimestamp } from "../utils/format";
import { MonitoringEmptyState, type MonitoringEmptyVariant } from "./monitoring-empty-state";
import { TableSkeleton } from "./monitoring-skeleton";

export interface AuditLogTableProps {
  entries: AuditLogEntry[];
  loading?: boolean;
  emptyVariant?: MonitoringEmptyVariant;
}

function AuditLogTable({
  entries,
  loading,
  emptyVariant = "no-audit",
}: AuditLogTableProps) {
  const columns = React.useMemo<ColumnDef<AuditLogEntry>[]>(
    () => [
      {
        accessorKey: "timestamp",
        header: "Time",
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-sm text-muted-foreground">
            {formatTimestamp(row.original.timestamp)}
          </span>
        ),
      },
      {
        accessorKey: "userName",
        header: "User",
        cell: ({ row }) => (
          <span className="font-medium text-foreground">{row.original.userName}</span>
        ),
      },
      {
        accessorKey: "action",
        header: "Action",
        cell: ({ row }) => (
          <div>
            <p className="text-foreground">{row.original.action}</p>
            <p className="text-xs text-muted-foreground">
              {row.original.resourceType}: {row.original.resource}
            </p>
          </div>
        ),
      },
      {
        accessorKey: "ipAddress",
        header: "IP",
        cell: ({ row }) => (
          <span className="font-mono text-xs text-muted-foreground">
            {row.original.ipAddress}
          </span>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <StatusBadge
            tone={row.original.status === "success" ? "success" : "danger"}
            size="sm"
            dot
          >
            {row.original.status}
          </StatusBadge>
        ),
      },
      {
        accessorKey: "environment",
        header: "Env",
        cell: ({ row }) => (
          <StatusBadge tone="neutral" size="sm">
            {row.original.environment}
          </StatusBadge>
        ),
      },
    ],
    []
  );

  if (loading) return <TableSkeleton />;
  if (entries.length === 0) {
    return <MonitoringEmptyState variant={emptyVariant} />;
  }

  return <DataTable columns={columns} data={entries} />;
}

export { AuditLogTable };
