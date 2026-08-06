"use client";

import * as React from "react";
import Link from "next/link";

import { StatusBadge } from "@/components/data-display/badges";
import { WidgetCard } from "@/components/dashboard";
import { Button } from "@/components/ui/button";
import { routes } from "@/config/routes";

import { usePullRequests } from "../../hooks/use-repositories";

const OpenPullRequestsWidget = React.memo(function OpenPullRequestsWidget({
  repositoryId,
}: {
  repositoryId: string;
}) {
  const { data = [], isLoading, isError, refetch } = usePullRequests(repositoryId);
  const open = data.filter((pr) => pr.status === "open" || pr.status === "draft").slice(0, 5);

  return (
    <WidgetCard
      title="Open pull requests"
      loading={isLoading}
      error={isError ? "Could not load pull requests" : undefined}
      onRetry={() => void refetch()}
      empty={!isLoading && !isError && open.length === 0}
      description={!isLoading && open.length === 0 ? "No open pull requests" : undefined}
      actions={
        <Button
          render={<Link href={routes.app.repositoryPullRequests(repositoryId)} />}
          size="sm"
          variant="outline"
        >
          View all
        </Button>
      }
    >
      <ul className="flex flex-col gap-3">
        {open.map((pr) => (
          <li key={pr.id} className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-foreground">
                #{pr.number} {pr.title}
              </p>
              <p className="text-xs text-muted-foreground">
                {pr.sourceBranch} → {pr.targetBranch}
              </p>
            </div>
            <StatusBadge tone={pr.status === "draft" ? "neutral" : "success"} size="sm">
              {pr.status}
            </StatusBadge>
          </li>
        ))}
      </ul>
    </WidgetCard>
  );
});

export { OpenPullRequestsWidget };
