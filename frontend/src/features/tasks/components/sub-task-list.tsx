"use client";

import Link from "next/link";

import { routes } from "@/config/routes";

import type { Task } from "../types/task.types";
import { PriorityBadge } from "./priority-badge";
import { TaskAssignee } from "./task-assignee";
import { TaskStatusBadge } from "./task-status-badge";

export interface SubTaskListProps {
  subtasks: Task[];
  onSelect?: (task: Task) => void;
}

function SubTaskList({ subtasks, onSelect }: SubTaskListProps) {
  if (subtasks.length === 0) {
    return <p className="text-sm text-muted-foreground">No subtasks.</p>;
  }

  return (
    <ul className="divide-y divide-border rounded-lg border border-border" data-slot="sub-task-list">
      {subtasks.map((task) => (
        <li key={task.id} className="flex items-center gap-3 px-3 py-2.5">
          <Link
            href={routes.app.task(task.id)}
            className="shrink-0 font-mono text-xs text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50"
          >
            {task.key}
          </Link>
          <button
            type="button"
            className="min-w-0 flex-1 truncate text-left text-sm font-medium outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring/50"
            onClick={() => onSelect?.(task)}
          >
            {task.title}
          </button>
          <TaskStatusBadge status={task.status} />
          <PriorityBadge priority={task.priority} />
          <TaskAssignee assignee={task.assignee} showName={false} size="sm" />
        </li>
      ))}
    </ul>
  );
}

export { SubTaskList };
