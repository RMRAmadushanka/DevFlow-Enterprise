"use client";

import * as React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";

import { StatusBadge } from "@/components/data-display/badges";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

import type { BacklogItem } from "../types/sprint.types";

const PRIORITY_TONE = {
  critical: "danger",
  high: "warning",
  medium: "info",
  low: "neutral",
  none: "neutral",
} as const;

export interface BacklogTaskCardProps {
  item: BacklogItem;
  selected?: boolean;
  onSelect?: (id: string, selected: boolean) => void;
  draggable?: boolean;
  className?: string;
}

function BacklogTaskCard({
  item,
  selected,
  onSelect,
  draggable = false,
  className,
}: BacklogTaskCardProps) {
  const sortable = useSortable({
    id: item.id,
    disabled: !draggable,
  });

  const style = draggable
    ? {
        transform: CSS.Transform.toString(sortable.transform),
        transition: sortable.transition,
        opacity: sortable.isDragging ? 0.5 : 1,
      }
    : undefined;

  return (
    <article
      ref={draggable ? sortable.setNodeRef : undefined}
      style={style}
      className={cn(
        "flex items-start gap-2 rounded-lg border border-border bg-card p-3 transition-colors hover:border-ring/40",
        draggable && "cursor-grab active:cursor-grabbing",
        selected && "border-primary/50 bg-primary/5",
        className
      )}
      data-slot="backlog-task-card"
    >
      {onSelect ? (
        <Checkbox
          checked={selected}
          onCheckedChange={(checked) => onSelect(item.id, Boolean(checked))}
          aria-label={`Select ${item.title}`}
        />
      ) : null}
      {draggable ? (
        <button
          type="button"
          className="mt-0.5 shrink-0 text-muted-foreground"
          {...sortable.attributes}
          {...sortable.listeners}
          aria-label={`Drag ${item.title}`}
        >
          <GripVertical className="size-4" />
        </button>
      ) : null}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="font-mono text-xs text-muted-foreground">{item.key}</span>
          <StatusBadge tone={PRIORITY_TONE[item.priority]} size="sm">
            {item.priority}
          </StatusBadge>
          {item.storyPoints !== undefined ? (
            <span className="rounded bg-muted px-1.5 py-0.5 text-xs tabular-nums">
              {item.storyPoints} pts
            </span>
          ) : null}
        </div>
        <p className="mt-1 text-sm font-medium text-foreground">{item.title}</p>
        <div className="mt-1 flex flex-wrap gap-2 text-xs text-muted-foreground">
          {item.epicName ? <span>{item.epicName}</span> : null}
          {item.assigneeName ? <span>{item.assigneeName}</span> : null}
        </div>
      </div>
    </article>
  );
}

export { BacklogTaskCard };
