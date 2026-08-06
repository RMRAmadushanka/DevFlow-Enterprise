"use client";

import * as React from "react";
import Link from "next/link";

import { ActivityTimeline } from "@/components/data-display/activity";
import { WidgetCard } from "@/components/dashboard";
import { Button } from "@/components/ui/button";
import { routes } from "@/config/routes";

import { useRepository } from "../../hooks/use-repositories";

const RepositoryActivityWidget = React.memo(function RepositoryActivityWidget({
  repositoryId,
}: {
  repositoryId: string;
}) {
  const { data, isLoading, isError, refetch } = useRepository(repositoryId);
  const activity = data?.activity ?? [];

  return (
    <WidgetCard
      title="Repository activity"
      loading={isLoading}
      error={isError ? "Could not load activity" : undefined}
      onRetry={() => void refetch()}
      empty={!isLoading && !isError && activity.length === 0}
      description={!isLoading && activity.length === 0 ? "No recent activity" : undefined}
      actions={
        <Button
          render={<Link href={routes.app.repository(repositoryId)} />}
          size="sm"
          variant="outline"
        >
          Overview
        </Button>
      }
    >
      <ActivityTimeline
        items={activity.slice(0, 6).map((entry) => ({
          id: entry.id,
          action: entry.summary,
          description: entry.actorName,
          timestamp: entry.timestamp,
        }))}
      />
    </WidgetCard>
  );
});

export { RepositoryActivityWidget };
