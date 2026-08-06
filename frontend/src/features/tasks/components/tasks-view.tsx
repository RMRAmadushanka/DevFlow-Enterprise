"use client";

import * as React from "react";
import { CalendarDays, Columns3, LayoutList, Plus, Table2 } from "lucide-react";

import { ListPageTemplate } from "@/components/layout/page-templates";
import { Button } from "@/components/ui/button";
import { PermissionGuard } from "@/lib/permissions";
import { routes } from "@/config/routes";

import { VIEW_OPTIONS } from "../constants/task.constants";
import { useTasks } from "../hooks/use-tasks";
import { useTaskStore } from "../store/task.store";
import type { Task, TaskViewMode } from "../types/task.types";
import { ArchiveTaskModal } from "./archive-task-modal";
import { CreateTaskModal } from "./create-task-modal";
import { DeleteTaskModal } from "./delete-task-modal";
import { MoveTaskModal } from "./move-task-modal";
import { TaskBoard } from "./task-board";
import { TaskBulkActions } from "./task-bulk-actions";
import { TaskCalendarFoundation } from "./task-calendar-foundation";
import { TaskDetailsDrawer } from "./task-details-drawer";
import { TaskEmptyState } from "./task-empty-state";
import { TaskFilters } from "./task-filters";
import { TaskHeader } from "./task-header";
import { TaskList } from "./task-list";
import { TaskSearch } from "./task-search";
import { TaskSort } from "./task-sort";
import { TaskTable } from "./task-table";

const VIEW_ICONS: Record<TaskViewMode, React.ReactNode> = {
  board: <Columns3 className="size-4" aria-hidden />,
  table: <Table2 className="size-4" aria-hidden />,
  list: <LayoutList className="size-4" aria-hidden />,
  calendar: <CalendarDays className="size-4" aria-hidden />,
};

export interface TasksViewProps {
  projectId?: string | null;
  title?: string;
  description?: string;
}

function TasksView({
  projectId,
  title = "Tasks",
  description = "Track and manage work across your projects.",
}: TasksViewProps) {
  const { data, isLoading, isError } = useTasks(projectId);
  const viewMode = useTaskStore((s) => s.viewMode);
  const setViewMode = useTaskStore((s) => s.setViewMode);
  const filters = useTaskStore((s) => s.filters);
  const activeTaskId = useTaskStore((s) => s.activeTaskId);
  const setActiveTaskId = useTaskStore((s) => s.setActiveTaskId);
  const selectedTaskIds = useTaskStore((s) => s.selectedTaskIds);
  const setSelectedTaskIds = useTaskStore((s) => s.setSelectedTaskIds);

  const [createOpen, setCreateOpen] = React.useState(false);
  const [moveTarget, setMoveTarget] = React.useState<Task | null>(null);
  const [archiveTarget, setArchiveTarget] = React.useState<Task | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<Task | null>(null);
  const [bulkDeleteIds, setBulkDeleteIds] = React.useState<string[]>([]);

  const items = data?.items ?? [];
  const hasQuery =
    Boolean(filters.q.trim()) ||
    filters.status !== "all" ||
    filters.priority !== "all" ||
    filters.myTasks ||
    filters.overdue;
  const emptyVariant = hasQuery ? "no-results" : "no-tasks";

  function handleSelectTask(task: Task) {
    setActiveTaskId(task.id);
  }

  return (
    <>
      <ListPageTemplate
        title={title}
        description={description}
        breadcrumbs={[
          { label: "Workspace", href: routes.app.home },
          { label: "Tasks", href: routes.app.tasks },
        ]}
        actions={<TaskHeader onCreateClick={() => setCreateOpen(true)} />}
        filters={
          <div className="flex w-full flex-col gap-3">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
              <TaskSearch className="max-w-md flex-1" />
              <TaskSort />
              <div
                role="group"
                aria-label="View mode"
                className="flex shrink-0 items-center gap-1"
              >
                {VIEW_OPTIONS.map((option) => (
                  <Button
                    key={option.value}
                    type="button"
                    size="icon-sm"
                    variant={viewMode === option.value ? "secondary" : "ghost"}
                    aria-pressed={viewMode === option.value}
                    aria-label={`${option.label} view`}
                    onClick={() => setViewMode(option.value)}
                  >
                    {VIEW_ICONS[option.value]}
                  </Button>
                ))}
              </div>
              <PermissionGuard permission="task.create">
                <Button type="button" className="lg:hidden" onClick={() => setCreateOpen(true)}>
                  <Plus className="size-4" />
                  Create
                </Button>
              </PermissionGuard>
            </div>
            <TaskFilters />
            <TaskBulkActions
              selectedIds={selectedTaskIds}
              onClearSelection={() => setSelectedTaskIds([])}
              onArchive={() => {
                const task = items.find((item) => selectedTaskIds.includes(item.id));
                if (task) setArchiveTarget(task);
              }}
              onDelete={(ids) => setBulkDeleteIds(ids)}
            />
          </div>
        }
        loading={false}
        empty={
          isError ? (
            <TaskEmptyState variant="no-results" />
          ) : !isLoading && items.length === 0 && viewMode !== "board" ? (
            <TaskEmptyState variant={emptyVariant} />
          ) : null
        }
      >
        {viewMode === "board" ? (
          <TaskBoard
            projectId={projectId}
            onSelectTask={handleSelectTask}
            onMoveTask={setMoveTarget}
            onArchiveTask={setArchiveTarget}
            emptyVariant={emptyVariant}
          />
        ) : null}

        {viewMode === "table" ? (
          <TaskTable
            tasks={items}
            loading={isLoading}
            emptyVariant={emptyVariant}
            selectedIds={selectedTaskIds}
            onSelectionChange={setSelectedTaskIds}
            onSelectTask={handleSelectTask}
            onMoveTask={setMoveTarget}
            onArchiveTask={setArchiveTarget}
            bulkActions={({ selectedRows }) => (
              <TaskBulkActions
                selectedIds={selectedRows.map((row) => row.original.id)}
                onClearSelection={() => setSelectedTaskIds([])}
                onArchive={() => {
                  const task = selectedRows[0]?.original;
                  if (task) setArchiveTarget(task);
                }}
                onDelete={(ids) => setBulkDeleteIds(ids)}
              />
            )}
          />
        ) : null}

        {viewMode === "list" ? (
          <TaskList
            tasks={items}
            loading={isLoading}
            emptyVariant={emptyVariant}
            onSelectTask={handleSelectTask}
            onMoveTask={setMoveTarget}
            onArchiveTask={setArchiveTarget}
          />
        ) : null}

        {viewMode === "calendar" ? (
          <TaskCalendarFoundation tasks={items} onSelectTask={handleSelectTask} />
        ) : null}
      </ListPageTemplate>

      <TaskDetailsDrawer
        taskId={activeTaskId}
        open={Boolean(activeTaskId)}
        onOpenChange={(open) => {
          if (!open) setActiveTaskId(null);
        }}
        onMove={setMoveTarget}
        onArchive={setArchiveTarget}
        onSelectTask={handleSelectTask}
      />

      <CreateTaskModal open={createOpen} onOpenChange={setCreateOpen} />

      <MoveTaskModal
        task={moveTarget}
        open={Boolean(moveTarget)}
        onOpenChange={(open) => {
          if (!open) setMoveTarget(null);
        }}
      />

      <ArchiveTaskModal
        task={archiveTarget}
        open={Boolean(archiveTarget)}
        onOpenChange={(open) => {
          if (!open) setArchiveTarget(null);
        }}
      />

      <DeleteTaskModal
        task={deleteTarget ?? items.find((item) => bulkDeleteIds.includes(item.id)) ?? null}
        open={Boolean(deleteTarget) || bulkDeleteIds.length > 0}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteTarget(null);
            setBulkDeleteIds([]);
          }
        }}
      />
    </>
  );
}

export { TasksView };
