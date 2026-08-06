"use client";

import type { Task } from "../types/task.types";
import { TaskCard } from "./task-card";
import { TaskEmptyState } from "./task-empty-state";
import { TaskSkeleton } from "./task-skeleton";

export interface TaskListProps {
  tasks: Task[];
  loading?: boolean;
  emptyVariant?: "no-tasks" | "no-results";
  onSelectTask?: (task: Task) => void;
  onMoveTask?: (task: Task) => void;
  onArchiveTask?: (task: Task) => void;
}

function TaskList({
  tasks,
  loading,
  emptyVariant = "no-tasks",
  onSelectTask,
  onMoveTask,
  onArchiveTask,
}: TaskListProps) {
  if (loading) {
    return (
      <div className="flex flex-col gap-3" aria-busy="true">
        <TaskSkeleton />
        <TaskSkeleton />
        <TaskSkeleton />
      </div>
    );
  }

  if (tasks.length === 0) {
    return <TaskEmptyState variant={emptyVariant} />;
  }

  return (
    <div className="flex flex-col gap-3" data-slot="task-list">
      {tasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          compact
          onSelect={onSelectTask}
          onMove={onMoveTask}
          onArchive={onArchiveTask}
        />
      ))}
    </div>
  );
}

export { TaskList };
