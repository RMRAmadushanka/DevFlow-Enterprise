"use client";

import * as React from "react";
import Link from "next/link";

import { StatusBadge } from "@/components/data-display/badges";
import type { Tone } from "@/components/data-display/shared/types";
import { WidgetCard } from "@/components/dashboard";
import { Button } from "@/components/ui/button";
import { routes } from "@/config/routes";

import { HEALTH_LABELS } from "../../constants/repository.constants";
import { useRepository } from "../../hooks/use-repositories";
import type { RepositoryHealth } from "../../types/repository.types";

const HEALTH_TONE: Record<RepositoryHealth, Tone> = {
  healthy: "success",
  at_risk: "warning",
  critical: "danger",
  unknown: "neutral",
};

const RepositoryHealthWidget = React.memo(function RepositoryHealthWidget({
  repositoryId,
}: {
  repositoryId: string;
}) {
  const { data, isLoading, isError, refetch } = useRepository(repositoryId);

  return (
    <WidgetCard
      title="Repository health"
      loading={isLoading}
      error={isError ? "Could not load health" : undefined}
      onRetry={() => void refetch()}
      actions={
        data ? (
          <Button
            render={<Link href={routes.app.repository(repositoryId)} />}
            size="sm"
            variant="outline"
          >
            View
          </Button>
        ) : undefined
      }
    >
      {data ? (
        <div className="flex flex-col gap-3">
          <StatusBadge tone={HEALTH_TONE[data.health]} size="sm" dot>
            {HEALTH_LABELS[data.health]}
          </StatusBadge>
          <p className="text-sm text-muted-foreground">
            {data.openPullRequests} open PRs · {data.openIssues} open issues
          </p>
        </div>
      ) : null}
    </WidgetCard>
  );
});

export { RepositoryHealthWidget };
