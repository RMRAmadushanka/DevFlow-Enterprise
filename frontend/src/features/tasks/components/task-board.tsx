"use client";

import * as React from "react";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";

import type { Task, TaskStatus } from "../types/task.types";
import { useMoveTask, useTaskBoard } from "../hooks/use-tasks";
import { BoardSkeleton } from "./task-skeleton";
import { TaskCard } from "./task-card";
import { TaskColumn } from "./task-column";
import { TaskEmptyState } from "./task-empty-state";

export interface TaskBoardProps {
  projectId?: string | null;
  onSelectTask?: (task: Task) => void;
  onMoveTask?: (task: Task) => void;
  onArchiveTask?: (task: Task) => void;
  emptyVariant?: "no-tasks" | "no-results";
}

function TaskBoard({
  projectId,
  onSelectTask,
  onMoveTask,
  onArchiveTask,
  emptyVariant = "no-tasks",
}: TaskBoardProps) {
  const { data, isLoading, collapsedColumns, toggleColumnCollapsed } = useTaskBoard(projectId);
  const moveTask = useMoveTask();
  const [activeTask, setActiveTask] = React.useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const columns = data ?? [];
  const allTasks = React.useMemo(
    () => columns.flatMap((column) => column.tasks),
    [columns]
  );
  const taskById = React.useMemo(
    () => new Map(allTasks.map((task) => [task.id, task])),
    [allTasks]
  );

  function handleDragStart(event: DragStartEvent) {
    const task = taskById.get(String(event.active.id));
    setActiveTask(task ?? null);
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveTask(null);
    const { active, over } = event;
    if (!over) return;

    const taskId = String(active.id);
    const task = taskById.get(taskId);
    if (!task) return;

    let targetStatus: TaskStatus | undefined;
    const overId = String(over.id);

    if (columns.some((column) => column.status === overId)) {
      targetStatus = overId as TaskStatus;
    } else {
      const overTask = taskById.get(overId);
      targetStatus = overTask?.status;
    }

    if (targetStatus && targetStatus !== task.status) {
      void moveTask.mutateAsync({ id: taskId, status: targetStatus });
    }
  }

  if (isLoading) return <BoardSkeleton />;
  if (columns.every((column) => column.tasks.length === 0)) {
    return <TaskEmptyState variant={emptyVariant} />;
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div
        className="flex gap-4 overflow-x-auto pb-4"
        role="region"
        aria-label="Task board"
        data-slot="task-board"
      >
        {columns.map((column) => (
          <TaskColumn
            key={column.status}
            column={column}
            collapsed={collapsedColumns.includes(column.status)}
            onToggleCollapse={toggleColumnCollapsed}
            onSelectTask={onSelectTask}
            onMoveTask={onMoveTask}
            onArchiveTask={onArchiveTask}
          />
        ))}
      </div>
      <DragOverlay>
        {activeTask ? <TaskCard task={activeTask} draggable compact className="shadow-lg" /> : null}
      </DragOverlay>
    </DndContext>
  );
}

export { TaskBoard };
