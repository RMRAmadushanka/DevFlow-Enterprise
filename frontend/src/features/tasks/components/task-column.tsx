"use client";

import { ChevronDown, ChevronRight } from "lucide-react";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import type { Task, TaskBoardColumn, TaskStatus } from "../types/task.types";
import { TaskCard } from "./task-card";

export interface TaskColumnProps {
  column: TaskBoardColumn;
  collapsed?: boolean;
  onToggleCollapse?: (status: TaskStatus) => void;
  onSelectTask?: (task: Task) => void;
  onMoveTask?: (task: Task) => void;
  onArchiveTask?: (task: Task) => void;
}

function TaskColumn({
  column,
  collapsed,
  onToggleCollapse,
  onSelectTask,
  onMoveTask,
  onArchiveTask,
}: TaskColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: column.status });
  const taskIds = column.tasks.map((task) => task.id);

  if (collapsed) {
    return (
      <div
        className="flex w-12 shrink-0 flex-col items-center gap-2 rounded-lg border border-border bg-muted/30 py-3"
        data-slot="task-column-collapsed"
      >
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label={`Expand ${column.label} column`}
          onClick={() => onToggleCollapse?.(column.status)}
        >
          <ChevronRight className="size-4" />
        </Button>
        <span
          className="text-xs font-medium text-muted-foreground [writing-mode:vertical-rl]"
          aria-hidden
        >
          {column.label}
        </span>
        <span className="rounded-full bg-muted px-1.5 py-0.5 text-xs tabular-nums">
          {column.tasks.length}
        </span>
      </div>
    );
  }

  return (
    <section
      ref={setNodeRef}
      className={cn(
        "flex w-72 shrink-0 flex-col rounded-lg border border-border bg-muted/20",
        isOver && "border-primary/50 bg-primary/5"
      )}
      data-slot="task-column"
      aria-label={`${column.label} column`}
    >
      <header className="flex items-center justify-between gap-2 border-b border-border px-3 py-2">
        <div className="flex min-w-0 items-center gap-2">
          <h2 className="truncate text-sm font-semibold text-foreground">{column.label}</h2>
          <span className="rounded-full bg-muted px-1.5 text-xs tabular-nums text-muted-foreground">
            {column.tasks.length}
          </span>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label={`Collapse ${column.label} column`}
          onClick={() => onToggleCollapse?.(column.status)}
        >
          <ChevronDown className="size-4" />
        </Button>
      </header>

      <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
        <div className="flex max-h-[calc(100vh-16rem)] flex-col gap-2 overflow-y-auto p-2">
          {column.tasks.length === 0 ? (
            <p className="py-8 text-center text-xs text-muted-foreground">Drop tasks here</p>
          ) : (
            column.tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                draggable
                compact
                onSelect={onSelectTask}
                onMove={onMoveTask}
                onArchive={onArchiveTask}
              />
            ))
          )}
        </div>
      </SortableContext>
    </section>
  );
}

export { TaskColumn };
