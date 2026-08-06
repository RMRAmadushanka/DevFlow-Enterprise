"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

import type { TaskLabel } from "../types/task.types";

export interface LabelBadgeProps {
  label: TaskLabel;
  className?: string;
}

function LabelBadge({ label, className }: LabelBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn("text-[0.6875rem] font-medium", className)}
      style={{ borderColor: `${label.color}66`, color: label.color }}
    >
      {label.name}
    </Badge>
  );
}

export { LabelBadge };
