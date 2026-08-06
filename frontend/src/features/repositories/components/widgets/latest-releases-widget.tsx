"use client";

import * as React from "react";
import Link from "next/link";

import { StatusBadge } from "@/components/data-display/badges";
import { WidgetCard } from "@/components/dashboard";
import { Button } from "@/components/ui/button";
import { routes } from "@/config/routes";

import { useReleases } from "../../hooks/use-repositories";
import { formatRelativeCommitDate } from "../../utils/format";

const LatestReleasesWidget = React.memo(function LatestReleasesWidget({
  repositoryId,
}: {
  repositoryId: string;
}) {
  const { data = [], isLoading, isError, refetch } = useReleases(repositoryId);
  const latest = data.slice(0, 4);

  return (
    <WidgetCard
      title="Latest releases"
      loading={isLoading}
      error={isError ? "Could not load releases" : undefined}
      onRetry={() => void refetch()}
      empty={!isLoading && !isError && latest.length === 0}
      description={!isLoading && latest.length === 0 ? "No releases yet" : undefined}
      actions={
        <Button
          render={<Link href={routes.app.repositoryReleases(repositoryId)} />}
          size="sm"
          variant="outline"
        >
          View all
        </Button>
      }
    >
      <ul className="flex flex-col gap-3">
        {latest.map((release) => (
          <li key={release.id} className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-foreground">
                {release.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {release.version}
                {release.publishedAt
                  ? ` · ${formatRelativeCommitDate(release.publishedAt)}`
                  : ""}
              </p>
            </div>
            <StatusBadge
              tone={
                release.status === "published"
                  ? "success"
                  : release.status === "prerelease"
                    ? "warning"
                    : "neutral"
              }
              size="sm"
            >
              {release.status}
            </StatusBadge>
          </li>
        ))}
      </ul>
    </WidgetCard>
  );
});

export { LatestReleasesWidget };
