"use client";

import { useReleases } from "../hooks/use-repositories";
import { ReleaseTimeline } from "./release-timeline";
import { ReleaseSkeleton } from "./repository-skeleton";
import { RepositoryEmptyState } from "./repository-empty-state";

export interface ReleaseListProps {
  repositoryId: string;
  layout?: "list" | "timeline";
}

function ReleaseList({ repositoryId, layout = "timeline" }: ReleaseListProps) {
  const { data: releases = [], isLoading, isError } = useReleases(repositoryId);

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <ReleaseSkeleton />
        <ReleaseSkeleton />
        <ReleaseSkeleton />
      </div>
    );
  }

  if (isError) {
    return <RepositoryEmptyState variant="no-releases" />;
  }

  return <ReleaseTimeline releases={releases} layout={layout} />;
}

export { ReleaseList };
