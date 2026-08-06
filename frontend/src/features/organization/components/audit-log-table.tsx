"use client";

import type { ColumnDef } from "@tanstack/react-table";
import * as React from "react";

import { DataTable } from "@/components/data-display/table";
import { FeatureEmptyState } from "@/components/architecture/empty";
import { formatRelativeTime } from "@/components/data-display/shared/formatters";
import { SkeletonTable } from "@/components/data-display/skeleton";

import { useAuditLogs } from "../hooks/use-organizations";
import type { AuditLogEntry } from "../types/organization.types";

export interface AuditLogTableProps {
  organizationId: string;
}

function AuditLogTable({ organizationId }: AuditLogTableProps) {
  const { data = [], isLoading, isError } = useAuditLogs(organizationId);

  const columns = React.useMemo<ColumnDef<AuditLogEntry>[]>(
    () => [
      { accessorKey: "actorName", header: "Actor" },
      { accessorKey: "action", header: "Action" },
      { accessorKey: "resource", header: "Resource" },
      { accessorKey: "ipAddress", header: "IP" },
      {
        accessorKey: "createdAt",
        header: "When",
        cell: ({ getValue }) => formatRelativeTime(String(getValue())),
      },
    ],
    []
  );

  if (isLoading) return <SkeletonTable rows={5} columns={5} aria-label="Loading audit logs" />;

  if (isError) {
    return (
      <FeatureEmptyState
        variant="no-results"
        title="Could not load audit logs"
        description="Security events are temporarily unavailable."
      />
    );
  }

  if (data.length === 0) {
    return (
      <FeatureEmptyState
        variant="no-data"
        title="No audit logs"
        description="Organization security events will appear here."
      />
    );
  }

  return (
    <DataTable
      columns={columns}
      data={data}
      getRowId={(row) => row.id}
      enablePagination
      enableSorting
      density="compact"
      noun="events"
    />
  );
}

export { AuditLogTable };
