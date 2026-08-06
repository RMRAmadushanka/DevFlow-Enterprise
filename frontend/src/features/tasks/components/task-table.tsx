"use client";

import * as React from "react";
import Link from "next/link";
import type { ColumnDef, Row, RowSelectionState } from "@tanstack/react-table";

import { formatRelativeTime } from "@/components/data-display/shared/formatters";
import { DataTable } from "@/components/data-display/table";

import { routes } from "@/config/routes";

import type { Task } from "../types/task.types";
import { PriorityBadge } from "./priority-badge";
import { TaskAssignee } from "./task-assignee";
import { TaskEmptyState } from "./task-empty-state";
import { TaskQuickActions } from "./task-quick-actions";
import { TaskStatusBadge } from "./task-status-badge";
import { TableSkeleton } from "./task-skeleton";

export interface TaskTableProps {
  tasks: Task[];
  loading?: boolean;
  emptyVariant?: "no-tasks" | "no-results";
  selectedIds?: string[];
  onSelectionChange?: (ids: string[]) => void;
  onSelectTask?: (task: Task) => void;
  onMoveTask?: (task: Task) => void;
  onArchiveTask?: (task: Task) => void;
  bulkActions?: (ctx: { selectedRows: Row<Task>[] }) => React.ReactNode;
}

function TaskTable({
  tasks,
  loading,
  emptyVariant = "no-tasks",
  selectedIds,
  onSelectionChange,
  onSelectTask,
  onMoveTask,
  onArchiveTask,
  bulkActions,
}: TaskTableProps) {
  const rowSelection = React.useMemo<RowSelectionState>(() => {
    if (!selectedIds) return {};
    return Object.fromEntries(selectedIds.map((id) => [id, true]));
  }, [selectedIds]);

  const columns = React.useMemo<ColumnDef<Task>[]>(
    () => [
      {
        accessorKey: "key",
        header: "ID",
        cell: ({ row }) => (
          <Link
            href={routes.app.task(row.original.id)}
            className="font-mono text-xs text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50"
          >
            {row.original.key}
          </Link>
        ),
      },
      {
        accessorKey: "title",
        header: "Title",
        cell: ({ row }) => (
          <button
            type="button"
            className="max-w-xs truncate text-left text-sm font-medium text-foreground outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring/50"
            onClick={() => onSelectTask?.(row.original)}
          >
            {row.original.title}
          </button>
        ),
      },
      {
        accessorKey: "projectName",
        header: "Project",
        cell: ({ getValue }) => (
          <span className="truncate text-sm text-foreground">{String(getValue())}</span>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <TaskStatusBadge status={row.original.status} />,
      },
      {
        accessorKey: "priority",
        header: "Priority",
        cell: ({ row }) => <PriorityBadge priority={row.original.priority} />,
      },
      {
        id: "assignee",
        header: "Assignee",
        cell: ({ row }) => <TaskAssignee assignee={row.original.assignee} />,
      },
      {
        id: "reporter",
        header: "Reporter",
        cell: ({ row }) => <TaskAssignee assignee={row.original.reporter} />,
      },
      {
        accessorKey: "sprintName",
        header: "Sprint",
        cell: ({ getValue }) => (
          <span className="text-sm text-muted-foreground">{String(getValue() ?? "—")}</span>
        ),
      },
      {
        accessorKey: "storyPoints",
        header: "Story Points",
        cell: ({ getValue }) => (
          <span className="tabular-nums text-sm">{getValue() != null ? String(getValue()) : "—"}</span>
        ),
      },
      {
        accessorKey: "dueDate",
        header: "Due Date",
        cell: ({ getValue }) => (
          <span className="text-sm text-muted-foreground">{String(getValue() ?? "—")}</span>
        ),
      },
      {
        accessorKey: "updatedAt",
        header: "Updated",
        cell: ({ getValue }) => (
          <span className="text-sm text-muted-foreground">
            {formatRelativeTime(String(getValue()))}
          </span>
        ),
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <TaskQuickActions
            task={row.original}
            onMove={onMoveTask}
            onArchive={onArchiveTask}
          />
        ),
      },
    ],
    [onArchiveTask, onMoveTask, onSelectTask]
  );

  if (loading) return <TableSkeleton />;
  if (tasks.length === 0) return <TaskEmptyState variant={emptyVariant} />;

  return (
    <DataTable
      columns={columns}
      data={tasks}
      getRowId={(row) => row.id}
      enablePagination={tasks.length > 10}
      enableRowSelection={Boolean(onSelectionChange || bulkActions)}
      enableMultiRowSelection
      rowSelection={selectedIds ? rowSelection : undefined}
      onRowSelectionChange={
        onSelectionChange
          ? (updater) => {
              const next =
                typeof updater === "function" ? updater(rowSelection) : updater;
              onSelectionChange(Object.keys(next).filter((id) => next[id]));
            }
          : undefined
      }
      bulkActions={bulkActions}
      density="comfortable"
      noun="tasks"
      aria-label="Tasks"
    />
  );
}

export { TaskTable };
