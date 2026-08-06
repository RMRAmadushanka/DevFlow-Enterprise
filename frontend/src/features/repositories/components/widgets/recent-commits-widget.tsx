"use client";

import * as React from "react";
import Link from "next/link";

import { WidgetCard } from "@/components/dashboard";
import { Button } from "@/components/ui/button";
import { routes } from "@/config/routes";

import { useCommits } from "../../hooks/use-repositories";
import { formatRelativeCommitDate } from "../../utils/format";

const RecentCommitsWidget = React.memo(function RecentCommitsWidget({
  repositoryId,
}: {
  repositoryId: string;
}) {
  const { data = [], isLoading, isError, refetch } = useCommits(repositoryId);
  const recent = data.slice(0, 5);

  return (
    <WidgetCard
      title="Recent commits"
      loading={isLoading}
      error={isError ? "Could not load commits" : undefined}
      onRetry={() => void refetch()}
      empty={!isLoading && !isError && recent.length === 0}
      description={!isLoading && recent.length === 0 ? "No commits yet" : undefined}
      actions={
        <Button
          render={<Link href={routes.app.repositoryCommits(repositoryId)} />}
          size="sm"
          variant="outline"
        >
          View all
        </Button>
      }
    >
      <ul className="flex flex-col gap-3">
        {recent.map((commit) => (
          <li key={commit.id} className="min-w-0">
            <p className="truncate text-sm font-medium text-foreground">
              {commit.message}
            </p>
            <p className="text-xs text-muted-foreground">
              <span className="font-mono">
                {commit.shortSha || commit.sha.slice(0, 7)}
              </span>
              {" · "}
              {commit.authorName}
              {" · "}
              <time dateTime={commit.committedAt}>
                {formatRelativeCommitDate(commit.committedAt)}
              </time>
            </p>
          </li>
        ))}
      </ul>
    </WidgetCard>
  );
});

export { RecentCommitsWidget };
