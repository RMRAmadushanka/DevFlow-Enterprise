"use client";

import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";

import { DataTable } from "@/components/data-display/table";
import { StatusBadge } from "@/components/data-display/badges";
import { formatRelativeTime } from "@/components/data-display/shared/formatters";
import { FeatureEmptyState } from "@/components/architecture/empty";

import { useLoginHistory } from "../hooks/use-account";
import type { LoginHistoryEntry } from "../types/auth.types";
import { SessionSkeleton } from "./skeletons";

function LoginHistoryTable() {
  const { data = [], isLoading } = useLoginHistory();

  const columns = React.useMemo<ColumnDef<LoginHistoryEntry>[]>(
    () => [
      {
        accessorKey: "at",
        header: "When",
        cell: ({ getValue }) => formatRelativeTime(String(getValue())),
      },
      { accessorKey: "browser", header: "Browser" },
      { accessorKey: "location", header: "Location" },
      { accessorKey: "ip", header: "IP" },
      {
        accessorKey: "success",
        header: "Result",
        cell: ({ getValue }) =>
          getValue() ? (
            <StatusBadge tone="success">Success</StatusBadge>
          ) : (
            <StatusBadge tone="danger">Failed</StatusBadge>
          ),
      },
    ],
    []
  );

  if (isLoading) return <SessionSkeleton />;
  if (data.length === 0) {
    return (
      <FeatureEmptyState
        variant="no-data"
        title="No login history"
        description="Successful and failed sign-ins will appear here."
      />
    );
  }

  return (
    <DataTable
      columns={columns}
      data={data}
      getRowId={(row) => row.id}
      enablePagination={false}
      density="compact"
      noun="events"
    />
  );
}

export { LoginHistoryTable };
