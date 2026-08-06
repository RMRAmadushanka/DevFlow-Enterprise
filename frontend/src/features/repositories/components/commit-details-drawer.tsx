"use client";

import { UserAvatar } from "@/components/data-display/avatars";
import { DetailDrawer } from "@/components/feedback/drawer";
import { StatusBadge } from "@/components/data-display/badges";

import { useCommit } from "../hooks/use-repositories";
import { formatRelativeCommitDate } from "../utils/format";
import { CommitSkeleton } from "./repository-skeleton";

export interface CommitDetailsDrawerProps {
  repositoryId: string;
  commitId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function CommitDetailsDrawer({
  repositoryId,
  commitId,
  open,
  onOpenChange,
}: CommitDetailsDrawerProps) {
  const { data: commit, isLoading } = useCommit(
    repositoryId,
    commitId ?? undefined
  );

  return (
    <DetailDrawer
      open={open}
      onOpenChange={onOpenChange}
      title={commit ? commit.shortSha || commit.sha.slice(0, 7) : "Commit"}
      size="lg"
    >
      {isLoading ? <CommitSkeleton /> : null}
      {!isLoading && commit ? (
        <div className="flex flex-col gap-4">
          <div>
            <h3 className="text-base font-semibold text-foreground">{commit.message}</h3>
            {commit.body ? (
              <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">
                {commit.body}
              </p>
            ) : null}
          </div>
          <div className="flex items-center gap-2">
            <UserAvatar
              user={{
                id: commit.authorId,
                name: commit.authorName,
                imageUrl: commit.authorAvatarUrl,
              }}
              size="sm"
            />
            <div className="text-sm">
              <p className="font-medium text-foreground">{commit.authorName}</p>
              <time
                className="text-xs text-muted-foreground"
                dateTime={commit.committedAt}
              >
                {formatRelativeCommitDate(commit.committedAt)}
              </time>
            </div>
          </div>
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-muted-foreground">SHA</dt>
              <dd className="font-mono text-foreground">{commit.sha}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Branch</dt>
              <dd className="text-foreground">{commit.branch}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Files changed</dt>
              <dd className="text-foreground">{commit.filesChanged}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Diff</dt>
              <dd>
                <span className="text-success">+{commit.additions}</span>{" "}
                <span className="text-danger">−{commit.deletions}</span>
              </dd>
            </div>
          </dl>
          {commit.tags.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {commit.tags.map((tag) => (
                <StatusBadge key={tag} tone="info" size="sm">
                  {tag}
                </StatusBadge>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
      {!isLoading && !commit && commitId ? (
        <p className="text-sm text-muted-foreground">Commit not found.</p>
      ) : null}
    </DetailDrawer>
  );
}

export { CommitDetailsDrawer };
