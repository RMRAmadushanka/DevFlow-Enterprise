"use client";

import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";

import { StatusBadge } from "@/components/data-display/badges";
import { DataTable } from "@/components/data-display/table";
import { Button } from "@/components/ui/button";

import { SERVICE_LABELS } from "../constants/monitoring.constants";
import type { TrackedError } from "../types/monitoring.types";
import { formatTimestamp } from "../utils/format";
import { ERROR_STATUS_TONE } from "./shared";
import { MonitoringEmptyState, type MonitoringEmptyVariant } from "./monitoring-empty-state";
import { TableSkeleton } from "./monitoring-skeleton";

export interface ErrorTrackingTableProps {
  errors: TrackedError[];
  loading?: boolean;
  emptyVariant?: MonitoringEmptyVariant;
  onSelect?: (error: TrackedError) => void;
}

function ErrorTrackingTable({
  errors,
  loading,
  emptyVariant = "no-errors",
  onSelect,
}: ErrorTrackingTableProps) {
  const columns = React.useMemo<ColumnDef<TrackedError>[]>(
    () => [
      {
        accessorKey: "message",
        header: "Error",
        cell: ({ row }) => (
          <div className="max-w-md">
            <p className="truncate font-medium text-foreground">{row.original.message}</p>
            <p className="truncate text-xs text-muted-foreground">
              {SERVICE_LABELS[row.original.service]} · {row.original.environment}
            </p>
          </div>
        ),
      },
      {
        accessorKey: "count",
        header: "Count",
        cell: ({ row }) => (
          <span className="tabular-nums text-foreground">{row.original.count}</span>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <StatusBadge tone={ERROR_STATUS_TONE[row.original.status]} size="sm" dot>
            {row.original.status}
          </StatusBadge>
        ),
      },
      {
        accessorKey: "lastSeenAt",
        header: "Last seen",
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {formatTimestamp(row.original.lastSeenAt)}
          </span>
        ),
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) =>
          onSelect ? (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => onSelect(row.original)}
            >
              Details
            </Button>
          ) : null,
      },
    ],
    [onSelect]
  );

  if (loading) return <TableSkeleton />;

  if (errors.length === 0) {
    return <MonitoringEmptyState variant={emptyVariant} />;
  }

  return (
    <DataTable
      columns={columns}
      data={errors}
      aria-label="Tracked errors"
    />
  );
}

export { ErrorTrackingTable };
