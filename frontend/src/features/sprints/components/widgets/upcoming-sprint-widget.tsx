"use client";

import * as React from "react";
import Link from "next/link";
import { CalendarClock } from "lucide-react";

import { WidgetCard } from "@/components/dashboard";
import { Button } from "@/components/ui/button";
import { routes } from "@/config/routes";

import { useSprints } from "../../hooks/use-sprints";
import { formatSprintRange } from "../../utils/dates";
import { SprintStatusBadge } from "../sprint-status-badge";

const UpcomingSprintWidget = React.memo(function UpcomingSprintWidget({
  projectId,
}: {
  projectId?: string | null;
}) {
  const { data, isLoading, isError, refetch } = useSprints(projectId);
  const upcoming = data?.upcoming?.[0] ?? null;

  return (
    <WidgetCard
      title="Upcoming sprint"
      description="Next planned iteration"
      icon={<CalendarClock className="size-4" />}
      loading={isLoading}
      empty={!isLoading && !upcoming}
      error={isError ? "Could not load sprint" : undefined}
      onRetry={() => void refetch()}
      actions={
        upcoming ? (
          <Button render={<Link href={routes.app.sprint(upcoming.id)} />} size="sm" variant="outline">
            View
          </Button>
        ) : undefined
      }
    >
      {upcoming ? (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-2">
            <span className="font-medium">{upcoming.name}</span>
            <SprintStatusBadge status={upcoming.status} size="sm" />
          </div>
          <p className="line-clamp-2 text-sm text-muted-foreground">{upcoming.goal}</p>
          <p className="text-xs text-muted-foreground">
            {formatSprintRange(upcoming.startDate, upcoming.endDate)}
          </p>
        </div>
      ) : null}
    </WidgetCard>
  );
});

export { UpcomingSprintWidget };
