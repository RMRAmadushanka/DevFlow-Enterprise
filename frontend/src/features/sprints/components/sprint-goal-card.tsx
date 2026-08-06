"use client";

import { Flag } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface SprintGoalCardProps {
  goal: string;
  description?: string;
  className?: string;
}

function SprintGoalCard({ goal, description, className }: SprintGoalCardProps) {
  return (
    <Card className={cn(className)} data-slot="sprint-goal-card">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Flag className="size-4 text-muted-foreground" aria-hidden />
          Sprint goal
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <p className="text-sm font-medium text-foreground">{goal || "No goal set"}</p>
        {description ? (
          <p className="text-sm text-muted-foreground">{description}</p>
        ) : null}
      </CardContent>
    </Card>
  );
}

export { SprintGoalCard };
