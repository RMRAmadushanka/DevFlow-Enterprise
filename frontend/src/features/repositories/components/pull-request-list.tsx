"use client";

import * as React from "react";

import { usePullRequests } from "../hooks/use-repositories";
import type { PullRequest } from "../types/repository.types";
import { PullRequestCard } from "./pull-request-card";
import { PullRequestDetailsDrawer } from "./pull-request-details-drawer";
import { PrSkeleton } from "./repository-skeleton";
import { RepositoryEmptyState } from "./repository-empty-state";

export interface PullRequestListProps {
  repositoryId: string;
}

function PullRequestList({ repositoryId }: PullRequestListProps) {
  const { data: pullRequests = [], isLoading, isError } = usePullRequests(repositoryId);
  const [selectedId, setSelectedId] = React.useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        <PrSkeleton />
        <PrSkeleton />
        <PrSkeleton />
      </div>
    );
  }

  if (isError || pullRequests.length === 0) {
    return <RepositoryEmptyState variant="no-pull-requests" />;
  }

  return (
    <div className="flex flex-col gap-3" data-slot="pull-request-list">
      {pullRequests.map((pr: PullRequest) => (
        <PullRequestCard
          key={pr.id}
          pullRequest={pr}
          onSelect={(item) => setSelectedId(item.id)}
        />
      ))}
      <PullRequestDetailsDrawer
        repositoryId={repositoryId}
        pullRequestId={selectedId}
        open={Boolean(selectedId)}
        onOpenChange={(open) => {
          if (!open) setSelectedId(null);
        }}
      />
    </div>
  );
}

export { PullRequestList };
