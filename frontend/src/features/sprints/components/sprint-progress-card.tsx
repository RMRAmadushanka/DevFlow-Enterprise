"use client";

import { Target } from "lucide-react";

import { ProgressBar } from "@/components/data-display/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface SprintProgressCardProps {
  completedPoints: number;
  committedPoints: number;
  remainingPoints?: number;
  completedTasks?: number;
  totalTasks?: number;
  className?: string;
}

function SprintProgressCard({
  completedPoints,
  committedPoints,
  remainingPoints,
  completedTasks,
  totalTasks,
  className,
}: SprintProgressCardProps) {
  const progress =
    committedPoints > 0 ? Math.min(100, Math.round((completedPoints / committedPoints) * 100)) : 0;
  const remaining = remainingPoints ?? Math.max(0, committedPoints - completedPoints);

  return (
    <Card className={cn(className)} data-slot="sprint-progress-card">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Target className="size-4 text-muted-foreground" aria-hidden />
          Sprint progress
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <ProgressBar
          value={progress}
          label="Story points"
          tone={progress >= 80 ? "success" : progress >= 50 ? "info" : "warning"}
        />
        <dl className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
          <div>
            <dt className="text-muted-foreground">Completed</dt>
            <dd className="font-semibold tabular-nums">{completedPoints} pts</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Committed</dt>
            <dd className="font-semibold tabular-nums">{committedPoints} pts</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Remaining</dt>
            <dd className="font-semibold tabular-nums">{remaining} pts</dd>
          </div>
          {totalTasks !== undefined && completedTasks !== undefined ? (
            <div>
              <dt className="text-muted-foreground">Tasks</dt>
              <dd className="font-semibold tabular-nums">
                {completedTasks}/{totalTasks}
              </dd>
            </div>
          ) : null}
        </dl>
      </CardContent>
    </Card>
  );
}

export { SprintProgressCard };
