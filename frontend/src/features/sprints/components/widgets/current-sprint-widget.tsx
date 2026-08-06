"use client";

import * as React from "react";
import Link from "next/link";

import { ProgressWidget, WidgetCard } from "@/components/dashboard";
import { Button } from "@/components/ui/button";
import { PermissionGuard } from "@/lib/permissions";
import { routes } from "@/config/routes";

import { useSprints } from "../../hooks/use-sprints";
import { completionPercent, remainingDays } from "../../utils/dates";

const CurrentSprintWidget = React.memo(function CurrentSprintWidget({
  projectId,
}: {
  projectId?: string | null;
}) {
  const { data, isLoading, isError, refetch } = useSprints(projectId);
  const sprint = data?.current ?? null;

  if (!isLoading && !isError && !sprint) {
    return (
      <WidgetCard title="Current sprint" empty description="No active sprint">
        <PermissionGuard permission="sprint.create">
          <Button render={<Link href={routes.app.sprintNew} />} size="sm">
            Create sprint
          </Button>
        </PermissionGuard>
      </WidgetCard>
    );
  }

  const progress = sprint
    ? completionPercent(sprint.completedPoints, sprint.committedPoints)
    : 0;

  return (
    <ProgressWidget
      title={sprint?.name ?? "Current sprint"}
      value={progress}
      description={
        sprint
          ? `${remainingDays(sprint.endDate)} days remaining · ${sprint.completedTaskCount}/${sprint.taskCount} tasks`
          : undefined
      }
      currentLabel={sprint ? `${progress}% complete` : undefined}
      goal={sprint?.goal ?? "Sprint goal"}
      loading={isLoading}
      error={isError ? "Could not load sprint" : undefined}
      onRetry={() => void refetch()}
      actions={
        sprint ? (
          <Button render={<Link href={routes.app.sprint(sprint.id)} />} size="sm" variant="outline">
            View
          </Button>
        ) : undefined
      }
    />
  );
});

export { CurrentSprintWidget };
