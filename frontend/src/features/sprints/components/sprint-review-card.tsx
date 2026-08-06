"use client";

import { ClipboardCheck } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

import type { SprintReview } from "../types/sprint.types";

export interface SprintReviewCardProps {
  review: SprintReview;
  className?: string;
}

function SprintReviewCard({ review, className }: SprintReviewCardProps) {
  return (
    <Card className={cn(className)} data-slot="sprint-review-card">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <ClipboardCheck className="size-4 text-muted-foreground" aria-hidden />
          Sprint review
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <dl className="grid gap-3 sm:grid-cols-3">
          <div>
            <dt className="text-sm text-muted-foreground">Velocity</dt>
            <dd className="text-lg font-semibold tabular-nums">{review.velocity} pts</dd>
          </div>
          <div>
            <dt className="text-sm text-muted-foreground">Completed</dt>
            <dd className="text-lg font-semibold tabular-nums">
              {review.completedTaskIds.length} tasks
            </dd>
          </div>
          <div>
            <dt className="text-sm text-muted-foreground">Incomplete</dt>
            <dd className="text-lg font-semibold tabular-nums">
              {review.incompleteTaskIds.length} tasks
            </dd>
          </div>
        </dl>
        {review.deploymentSummary ? (
          <div>
            <h4 className="text-sm font-medium">Deployment summary</h4>
            <p className="mt-1 text-sm text-muted-foreground">{review.deploymentSummary}</p>
          </div>
        ) : null}
        {review.teamPerformance ? (
          <div>
            <h4 className="text-sm font-medium">Team performance</h4>
            <p className="mt-1 text-sm text-muted-foreground">{review.teamPerformance}</p>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

export { SprintReviewCard };
