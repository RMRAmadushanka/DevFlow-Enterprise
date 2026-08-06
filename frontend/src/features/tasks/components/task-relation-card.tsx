"use client";

import Link from "next/link";

import { routes } from "@/config/routes";

import type { TaskRelation } from "../types/task.types";
import { TaskStatusBadge } from "./task-status-badge";

export interface TaskRelationCardProps {
  relations: TaskRelation[];
  onSelect?: (relation: TaskRelation) => void;
}

const RELATION_LABELS: Record<TaskRelation["type"], string> = {
  blocks: "Blocks",
  blocked_by: "Blocked by",
  related: "Related",
  duplicate: "Duplicate of",
  parent: "Parent",
  child: "Child",
};

function TaskRelationCard({ relations, onSelect }: TaskRelationCardProps) {
  if (relations.length === 0) {
    return <p className="text-sm text-muted-foreground">No linked tasks.</p>;
  }

  return (
    <ul className="divide-y divide-border rounded-lg border border-border" data-slot="task-relation-card">
      {relations.map((relation) => (
        <li key={relation.id} className="flex items-center gap-3 px-3 py-2.5">
          <span className="shrink-0 text-xs font-medium text-muted-foreground">
            {RELATION_LABELS[relation.type]}
          </span>
          <Link
            href={routes.app.task(relation.taskId)}
            className="shrink-0 font-mono text-xs text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50"
          >
            {relation.taskKey}
          </Link>
          <button
            type="button"
            className="min-w-0 flex-1 truncate text-left text-sm outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring/50"
            onClick={() => onSelect?.(relation)}
          >
            {relation.taskTitle}
          </button>
          <TaskStatusBadge status={relation.status} />
        </li>
      ))}
    </ul>
  );
}

export { TaskRelationCard };
