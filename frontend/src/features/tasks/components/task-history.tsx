"use client";

import { formatRelativeTime } from "@/components/data-display/shared/formatters";

import type { TaskActivityItem } from "../types/task.types";

export interface TaskHistoryProps {
  items: TaskActivityItem[];
  limit?: number;
}

function TaskHistory({ items, limit }: TaskHistoryProps) {
  const visible = limit ? items.slice(0, limit) : items;

  if (visible.length === 0) {
    return <p className="text-sm text-muted-foreground">No history yet.</p>;
  }

  return (
    <ul className="divide-y divide-border" aria-label="Task history" data-slot="task-history">
      {visible.map((item) => (
        <li key={item.id} className="flex flex-col gap-0.5 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0 text-sm text-foreground">
            <span className="font-medium">{item.actorName}</span> {item.summary}
            {item.meta ? (
              <span className="mt-0.5 block text-xs text-muted-foreground">{item.meta}</span>
            ) : null}
          </div>
          <time className="shrink-0 text-xs text-muted-foreground" dateTime={item.timestamp}>
            {formatRelativeTime(item.timestamp)}
          </time>
        </li>
      ))}
    </ul>
  );
}

export { TaskHistory };
