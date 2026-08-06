"use client";

import * as React from "react";

import { DataTable } from "@/components/data-display/table";
import { WidgetCard } from "@/components/dashboard/widgets";
import { DashboardEmptyState } from "@/components/dashboard/widgets";
import type { DashboardTableProps } from "./types";

/**
 * Compact dashboard table for recent projects, deployments, etc.
 * Thin chrome around DataTable — pagination and actions stay prop-driven.
 */
function DashboardTable<TData>({
  title,
  description,
  actions,
  compact = true,
  loading,
  empty,
  error,
  onRetry,
  className,
  data,
  ...tableProps
}: DashboardTableProps<TData>) {
  const isEmpty = empty ?? data.length === 0;

  return (
    <WidgetCard
      title={title}
      description={description}
      actions={actions}
      loading={loading}
      empty={!loading && !error && isEmpty}
      error={error}
      onRetry={onRetry}
      emptyState={<DashboardEmptyState />}
      className={className}
      contentClassName="px-0"
    >
      <DataTable
        {...tableProps}
        data={data}
        density={compact ? "compact" : "comfortable"}
        enablePagination={tableProps.enablePagination ?? true}
      />
    </WidgetCard>
  );
}

export { DashboardTable };
