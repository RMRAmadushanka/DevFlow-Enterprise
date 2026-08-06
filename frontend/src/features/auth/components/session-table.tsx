"use client";

import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/data-display/table";
import { FeatureEmptyState } from "@/components/architecture/empty";
import { formatRelativeTime } from "@/components/data-display/shared/formatters";

import { useRevokeSession, useSessions } from "../hooks/use-account";
import type { ActiveSession } from "../types/auth.types";
import { SessionSkeleton } from "./skeletons";

function SessionTable() {
  const { data = [], isLoading } = useSessions();
  const revoke = useRevokeSession();

  const columns = React.useMemo<ColumnDef<ActiveSession>[]>(
    () => [
      {
        accessorKey: "device",
        header: "Device",
        cell: ({ row }) => (
          <span className="font-medium">
            {row.original.device}
            {row.original.current ? (
              <span className="ml-2 text-xs text-success">(This device)</span>
            ) : null}
          </span>
        ),
      },
      { accessorKey: "browser", header: "Browser" },
      { accessorKey: "location", header: "Location" },
      {
        accessorKey: "createdAt",
        header: "Created",
        cell: ({ getValue }) => formatRelativeTime(String(getValue())),
      },
      {
        accessorKey: "lastActiveAt",
        header: "Last active",
        cell: ({ getValue }) => formatRelativeTime(String(getValue())),
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) =>
          row.original.current ? (
            <span className="text-xs text-muted-foreground">Current</span>
          ) : (
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={revoke.isPending}
              onClick={() => void revoke.mutateAsync(row.original.id)}
            >
              Log out
            </Button>
          ),
      },
    ],
    [revoke]
  );

  if (isLoading) return <SessionSkeleton />;

  if (data.length === 0) {
    return <FeatureEmptyState variant="no-data" title="No sessions" description="There are no active sessions." />;
  }

  return (
    <DataTable
      columns={columns}
      data={data}
      getRowId={(row) => row.id}
      enablePagination={false}
      enableSorting
      density="compact"
      noun="sessions"
    />
  );
}

export { SessionTable };
