"use client";

import * as React from "react";
import Link from "next/link";
import {
  Calendar,
  CheckSquare,
  MessageSquare,
  Paperclip,
  Star,
} from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { ProgressBar } from "@/components/data-display/progress";
import { formatRelativeTime } from "@/components/data-display/shared/formatters";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { routes } from "@/config/routes";

import { checklistProgress, isOverdue } from "../utils/format";
import type { Task } from "../types/task.types";
import { LabelBadge } from "./label-badge";
import { PriorityBadge } from "./priority-badge";
import { TaskAssignee } from "./task-assignee";
import { TaskQuickActions } from "./task-quick-actions";

export interface TaskCardProps {
  task: Task;
  onSelect?: (task: Task) => void;
  onMove?: (task: Task) => void;
  onArchive?: (task: Task) => void;
  draggable?: boolean;
  compact?: boolean;
  className?: string;
}

function TaskCardInner({
  task,
  onSelect,
  onMove,
  onArchive,
  draggable = false,
  compact,
  className,
}: TaskCardProps) {
  const sortable = useSortable({
    id: task.id,
    disabled: !draggable,
  });

  const style = draggable
    ? {
        transform: CSS.Transform.toString(sortable.transform),
        transition: sortable.transition,
        opacity: sortable.isDragging ? 0.5 : 1,
      }
    : undefined;

  const overdue = isOverdue(task.dueDate, task.status);
  const checklistPct = checklistProgress(task.checklistCompleted, task.checklistTotal);

  return (
    <article
      ref={draggable ? sortable.setNodeRef : undefined}
      style={style}
      {...(draggable ? { ...sortable.attributes, ...sortable.listeners } : {})}
      className={cn(
        "group flex flex-col gap-2 rounded-lg border border-border bg-card p-3 transition-colors hover:border-ring/40",
        draggable && "cursor-grab active:cursor-grabbing",
        compact && "gap-1.5 p-2.5",
        className
      )}
      data-slot="task-card"
      onClick={() => onSelect?.(task)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect?.(task);
        }
      }}
      role="button"
      tabIndex={0}
      aria-label={`${task.key}: ${task.title}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 flex-wrap items-center gap-1.5">
          <Link
            href={routes.app.task(task.id)}
            className="text-xs font-medium text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50"
            onClick={(event) => event.stopPropagation()}
          >
            {task.key}
          </Link>
          {task.favorite ? (
            <Star className="size-3 fill-warning text-warning" aria-label="Favorited" />
          ) : null}
          <PriorityBadge priority={task.priority} />
        </div>
        <div
          className="flex shrink-0 items-center opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100"
          onClick={(event) => event.stopPropagation()}
          onKeyDown={(event) => event.stopPropagation()}
        >
          <TaskQuickActions task={task} onMove={onMove} onArchive={onArchive} compact />
        </div>
      </div>

      <h3 className="line-clamp-2 text-sm font-medium text-foreground">{task.title}</h3>

      {task.labels.length > 0 ? (
        <div className="flex flex-wrap gap-1">
          {task.labels.slice(0, 3).map((label) => (
            <LabelBadge key={label.id} label={label} />
          ))}
        </div>
      ) : null}

      {task.checklistTotal > 0 ? (
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[0.6875rem] text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <CheckSquare className="size-3" aria-hidden />
              Checklist
            </span>
            <span className="tabular-nums">
              {task.checklistCompleted}/{task.checklistTotal}
            </span>
          </div>
          <ProgressBar value={checklistPct} size="sm" showValue={false} animated={false} />
        </div>
      ) : null}

      <div className="mt-auto flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <TaskAssignee assignee={task.assignee} showName={false} size="sm" />
        {task.dueDate ? (
          <span
            className={cn(
              "inline-flex items-center gap-1",
              overdue && "font-medium text-destructive"
            )}
          >
            <Calendar className="size-3" aria-hidden />
            {task.dueDate}
          </span>
        ) : null}
        {task.storyPoints != null ? (
          <span className="rounded bg-muted px-1.5 py-0.5 tabular-nums">{task.storyPoints} pts</span>
        ) : null}
        {task.commentCount > 0 ? (
          <span className="inline-flex items-center gap-0.5 tabular-nums">
            <MessageSquare className="size-3" aria-hidden />
            {task.commentCount}
          </span>
        ) : null}
        {task.attachmentCount > 0 ? (
          <span className="inline-flex items-center gap-0.5 tabular-nums">
            <Paperclip className="size-3" aria-hidden />
            {task.attachmentCount}
          </span>
        ) : null}
        <span className="ml-auto">{formatRelativeTime(task.updatedAt)}</span>
      </div>

      {!compact ? (
        <Button
          render={<Link href={routes.app.task(task.id)} />}
          variant="outline"
          size="sm"
          className="mt-1"
          onClick={(event: React.MouseEvent) => event.stopPropagation()}
        >
          Open task
        </Button>
      ) : null}
    </article>
  );
}

const TaskCard = React.memo(TaskCardInner);

export { TaskCard };
