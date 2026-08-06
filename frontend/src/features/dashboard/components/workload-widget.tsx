"use client";

import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";

import { DashboardTable } from "@/components/dashboard";
import { UserAvatar } from "@/components/data-display/avatars";
import { ProgressBar } from "@/components/data-display/progress";

import { useDashboardMetrics } from "../hooks/use-dashboard-metrics";
import type { WorkloadMember } from "../types/dashboard.types";

const WorkloadWidget = React.memo(function WorkloadWidget() {
  const { data, isLoading, isError, refetch } = useDashboardMetrics();
  const members = data?.workload ?? [];

  const columns = React.useMemo<ColumnDef<WorkloadMember>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Member",
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <UserAvatar
              user={{ name: row.original.name, imageUrl: row.original.avatarUrl }}
              size="sm"
            />
            <span className="font-medium">{row.original.name}</span>
          </div>
        ),
      },
      { accessorKey: "assignedTasks", header: "Assigned" },
      { accessorKey: "completedTasks", header: "Completed" },
      {
        id: "capacity",
        header: "Capacity",
        cell: ({ row }) => {
          const used = Math.min(
            100,
            Math.round((row.original.assignedTasks / row.original.capacity) * 100)
          );
          return (
            <div className="min-w-28">
              <ProgressBar
                value={used}
                label={`${row.original.assignedTasks}/${row.original.capacity}`}
              />
            </div>
          );
        },
      },
    ],
    []
  );

  return (
    <DashboardTable
      title="Team workload"
      description="Assigned work and capacity"
      columns={columns}
      data={members}
      getRowId={(row) => row.id}
      loading={isLoading}
      empty={!isLoading && !isError && members.length === 0}
      error={isError ? "Could not load workload" : undefined}
      onRetry={() => void refetch()}
      enablePagination={false}
      noun="members"
    />
  );
});

export { WorkloadWidget };
