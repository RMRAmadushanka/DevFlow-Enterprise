"use client";

import { TaskBoard } from "@/features/tasks";
import { cn } from "@/lib/utils";

export interface SprintBoardProps {
  projectId: string;
  className?: string;
}

function SprintBoard({ projectId, className }: SprintBoardProps) {
  return (
    <div className={cn(className)} data-slot="sprint-board">
      <TaskBoard projectId={projectId} emptyVariant="no-results" />
    </div>
  );
}

export { SprintBoard };
