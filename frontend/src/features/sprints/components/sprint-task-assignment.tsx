"use client";

import { ListTodo } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

import type { BacklogItem } from "../types/sprint.types";

export interface SprintTaskAssignmentProps {
  tasks: BacklogItem[];
  className?: string;
}

function SprintTaskAssignment({ tasks, className }: SprintTaskAssignmentProps) {
  const totalPoints = tasks.reduce((sum, task) => sum + (task.storyPoints ?? 0), 0);

  return (
    <Card className={cn(className)} data-slot="sprint-task-assignment">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between gap-2 text-base">
          <span className="inline-flex items-center gap-2">
            <ListTodo className="size-4 text-muted-foreground" aria-hidden />
            Selected tasks
          </span>
          <span className="text-sm font-normal text-muted-foreground tabular-nums">
            {tasks.length} tasks · {totalPoints} pts
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {tasks.length === 0 ? (
          <p className="text-sm text-muted-foreground">No tasks selected.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {tasks.map((task) => (
              <li
                key={task.id}
                className="flex items-center justify-between gap-2 rounded-md border border-border px-3 py-2 text-sm"
              >
                <div className="min-w-0">
                  <span className="font-mono text-xs text-muted-foreground">{task.key}</span>
                  <p className="truncate font-medium">{task.title}</p>
                </div>
                {task.storyPoints !== undefined ? (
                  <span className="shrink-0 tabular-nums text-muted-foreground">
                    {task.storyPoints} pts
                  </span>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

export { SprintTaskAssignment };
