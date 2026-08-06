"use client";

import { StatusBadge } from "@/components/data-display/badges";
import { Card, CardContent } from "@/components/ui/card";

import { useTags } from "../hooks/use-repositories";
import { formatRelativeCommitDate } from "../utils/format";
import { RepositoryEmptyState } from "./repository-empty-state";
import { ReleaseSkeleton } from "./repository-skeleton";

export interface TagListProps {
  repositoryId: string;
}

function TagList({ repositoryId }: TagListProps) {
  const { data: tags = [], isLoading, isError } = useTags(repositoryId);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        <ReleaseSkeleton />
        <ReleaseSkeleton />
      </div>
    );
  }

  if (isError || tags.length === 0) {
    return <RepositoryEmptyState variant="no-releases" />;
  }

  return (
    <div className="flex flex-col gap-3" data-slot="tag-list">
      {tags.map((tag) => (
        <Card key={tag.id}>
          <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
            <div className="min-w-0">
              <p className="font-medium text-foreground">{tag.name}</p>
              <p className="text-xs text-muted-foreground">
                <span className="font-mono">{tag.commitShortSha}</span>
                {" · "}
                {tag.authorName}
                {" · "}
                <time dateTime={tag.createdAt}>
                  {formatRelativeCommitDate(tag.createdAt)}
                </time>
              </p>
            </div>
            {tag.releaseName ? (
              <StatusBadge tone="info" size="sm">
                {tag.releaseName}
              </StatusBadge>
            ) : null}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export { TagList };
