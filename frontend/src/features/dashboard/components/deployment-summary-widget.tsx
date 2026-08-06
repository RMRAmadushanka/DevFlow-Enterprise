"use client";

import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";

import { DashboardTable } from "@/components/dashboard";
import { StatusBadge } from "@/components/data-display/badges";
import { formatRelativeTime } from "@/components/data-display/shared/formatters";
import type { Tone } from "@/components/data-display/shared/types";

import { useDashboardDeployments } from "../hooks/use-dashboard-metrics";
import type { DashboardDeployment, DeploymentStatus } from "../types/dashboard.types";

const STATUS_TONE: Record<DeploymentStatus, Tone> = {
  success: "success",
  failed: "danger",
  building: "info",
  cancelled: "neutral",
};

const DeploymentSummaryWidget = React.memo(function DeploymentSummaryWidget() {
  const { data = [], isLoading, isError, refetch } = useDashboardDeployments();

  const columns = React.useMemo<ColumnDef<DashboardDeployment>[]>(
    () => [
      { accessorKey: "projectName", header: "Project" },
      { accessorKey: "environment", header: "Environment" },
      { accessorKey: "version", header: "Version" },
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
        accessorKey: "deployedAt",
        header: "Time",
        cell: ({ getValue }) => formatRelativeTime(String(getValue())),
      },
      { accessorKey: "author", header: "Author" },
    ],
    []
  );

  return (
    <DashboardTable
      title="Deployment summary"
      description="Latest deployments across environments"
      columns={columns}
      data={data}
      getRowId={(row) => row.id}
      loading={isLoading}
      empty={!isLoading && !isError && data.length === 0}
      error={isError ? "Could not load deployments" : undefined}
      onRetry={() => void refetch()}
      enablePagination={false}
      noun="deployments"
    />
  );
});

export { DeploymentSummaryWidget };
