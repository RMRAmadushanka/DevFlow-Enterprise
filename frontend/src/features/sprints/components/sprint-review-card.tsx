"use client";

import * as React from "react";
import { ClipboardCheck, Pencil } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TextareaField } from "@/components/forms/textarea";
import { cn } from "@/lib/utils";

import { useReview, useUpdateReview } from "../hooks/use-sprints";
import type { SprintReview } from "../types/sprint.types";
import { toSprintErrorMessage } from "../utils/errors";
import { ChartSkeleton } from "./sprint-skeleton";

export interface SprintReviewCardProps {
  review: SprintReview;
  className?: string;
  editable?: boolean;
  saving?: boolean;
  saveError?: string;
  onSave?: (payload: { deploymentSummary: string; teamPerformance: string }) => void | Promise<void>;
}

function SprintReviewCard({
  review,
  className,
  editable = false,
  saving = false,
  saveError,
  onSave,
}: SprintReviewCardProps) {
  const [isEditing, setIsEditing] = React.useState(false);
  const [deploymentSummary, setDeploymentSummary] = React.useState(review.deploymentSummary);
  const [teamPerformance, setTeamPerformance] = React.useState(review.teamPerformance);

  React.useEffect(() => {
    setDeploymentSummary(review.deploymentSummary);
    setTeamPerformance(review.teamPerformance);
  }, [review.deploymentSummary, review.teamPerformance]);

  async function handleSave() {
    if (!onSave) return;
    await onSave({ deploymentSummary, teamPerformance });
    setIsEditing(false);
  }

  return (
    <Card className={cn(className)} data-slot="sprint-review-card">
      <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <ClipboardCheck className="size-4 text-muted-foreground" aria-hidden />
          Sprint review
        </CardTitle>
        {editable && !isEditing ? (
          <Button type="button" size="sm" variant="outline" onClick={() => setIsEditing(true)}>
            <Pencil className="size-3.5" />
            Edit
          </Button>
        ) : null}
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <dl className="grid gap-3 sm:grid-cols-3">
          <div>
            <dt className="text-sm text-muted-foreground">Velocity</dt>
            <dd className="text-lg font-semibold tabular-nums">{review.velocity} pts</dd>
          </div>
          <div>
            <dt className="text-sm text-muted-foreground">Completed</dt>
            <dd className="text-lg font-semibold tabular-nums">{review.completedPoints} pts</dd>
          </div>
          <div>
            <dt className="text-sm text-muted-foreground">Incomplete</dt>
            <dd className="text-lg font-semibold tabular-nums">{review.incompleteCount} tasks</dd>
          </div>
        </dl>

        {isEditing ? (
          <div className="flex flex-col gap-3">
            <TextareaField
              label="Deployment summary"
              value={deploymentSummary}
              onChange={setDeploymentSummary}
              rows={2}
            />
            <TextareaField
              label="Team performance"
              value={teamPerformance}
              onChange={setTeamPerformance}
              rows={2}
            />
            {saveError ? <p className="text-sm text-danger">{saveError}</p> : null}
            <div className="flex items-center gap-2">
              <Button type="button" size="sm" onClick={() => void handleSave()} disabled={saving}>
                {saving ? "Saving…" : "Save"}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={saving}
                onClick={() => {
                  setIsEditing(false);
                  setDeploymentSummary(review.deploymentSummary);
                  setTeamPerformance(review.teamPerformance);
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <>
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
          </>
        )}
      </CardContent>
    </Card>
  );
}

export interface SprintReviewSectionProps {
  sprintId: string;
  className?: string;
}

/** Wires `SprintReviewCard` to the sprint review API (fetch + inline edit). */
function SprintReviewSection({ sprintId, className }: SprintReviewSectionProps) {
  const { data: review, isLoading } = useReview(sprintId);
  const updateReview = useUpdateReview(sprintId);

  if (isLoading) {
    return <ChartSkeleton height={180} />;
  }

  if (!review) return null;

  return (
    <SprintReviewCard
      review={review}
      className={className}
      editable
      saving={updateReview.isPending}
      saveError={updateReview.error ? toSprintErrorMessage(updateReview.error) : undefined}
      onSave={async (payload) => {
        await updateReview.mutateAsync(payload);
      }}
    />
  );
}

export { SprintReviewCard, SprintReviewSection };
