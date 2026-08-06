"use client";

import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { LayoutList, List } from "lucide-react";

import { UserAvatar } from "@/components/data-display/avatars";
import { DataTable } from "@/components/data-display/table";
import { Button } from "@/components/ui/button";

import { useCommits } from "../hooks/use-repositories";
import { useRepositoryStore } from "../store/repository.store";
import type { Commit } from "../types/repository.types";
import { formatRelativeCommitDate } from "../utils/format";
import { BranchSelector } from "./branch-selector";
import { CommitDetailsDrawer } from "./commit-details-drawer";
import { CommitTimeline } from "./commit-timeline";
import { CommitSkeleton } from "./repository-skeleton";
import { RepositoryEmptyState } from "./repository-empty-state";

export interface CommitListProps {
  repositoryId: string;
}

function CommitList({ repositoryId }: CommitListProps) {
  const { data: commits = [], isLoading, isError } = useCommits(repositoryId);
  const commitViewMode = useRepositoryStore((s) => s.commitViewMode);
  const setCommitViewMode = useRepositoryStore((s) => s.setCommitViewMode);
  const [selectedId, setSelectedId] = React.useState<string | null>(null);

  const columns = React.useMemo<ColumnDef<Commit>[]>(
    () => [
      {
        accessorKey: "message",
        header: "Commit",
        cell: ({ row }) => (
          <button
            type="button"
            className="max-w-md truncate text-left font-medium text-foreground outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring/50"
            onClick={() => setSelectedId(row.original.id)}
          >
            {row.original.message}
          </button>
        ),
      },
      {
        accessorKey: "shortSha",
        header: "SHA",
        cell: ({ row }) => (
          <span className="font-mono text-sm">
            {row.original.shortSha || row.original.sha.slice(0, 7)}
          </span>
        ),
      },
      {
        id: "author",
        header: "Author",
        cell: ({ row }) => (
          <span className="inline-flex items-center gap-2 text-sm">
            <UserAvatar
              user={{
                id: row.original.authorId,
                name: row.original.authorName,
                imageUrl: row.original.authorAvatarUrl,
              }}
              size="sm"
            />
            {row.original.authorName}
          </span>
        ),
      },
      {
        accessorKey: "branch",
        header: "Branch",
      },
      {
        accessorKey: "committedAt",
        header: "Date",
        cell: ({ row }) => (
          <time className="text-sm text-muted-foreground" dateTime={row.original.committedAt}>
            {formatRelativeCommitDate(row.original.committedAt)}
          </time>
        ),
      },
    ],
    []
  );

  return (
    <div className="flex flex-col gap-4" data-slot="commit-list">
      <div className="flex flex-wrap items-end gap-3">
        <BranchSelector repositoryId={repositoryId} />
        <div role="group" aria-label="Commit view" className="flex items-center gap-1">
          <Button
            type="button"
            size="icon-sm"
            variant={commitViewMode === "timeline" ? "secondary" : "ghost"}
            aria-pressed={commitViewMode === "timeline"}
            aria-label="Timeline view"
            onClick={() => setCommitViewMode("timeline")}
          >
            <LayoutList className="size-4" />
          </Button>
          <Button
            type="button"
            size="icon-sm"
            variant={commitViewMode === "table" ? "secondary" : "ghost"}
            aria-pressed={commitViewMode === "table"}
            aria-label="Table view"
            onClick={() => setCommitViewMode("table")}
          >
            <List className="size-4" />
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-3">
          <CommitSkeleton />
          <CommitSkeleton />
          <CommitSkeleton />
        </div>
      ) : null}

      {!isLoading && (isError || commits.length === 0) ? (
        <RepositoryEmptyState variant="no-commits" />
      ) : null}

      {!isLoading && commits.length > 0 && commitViewMode === "timeline" ? (
        <CommitTimeline
          commits={commits}
          onSelect={(c) => setSelectedId(c.id)}
        />
      ) : null}

      {!isLoading && commits.length > 0 && commitViewMode === "table" ? (
        <DataTable columns={columns} data={commits} />
      ) : null}

      <CommitDetailsDrawer
        repositoryId={repositoryId}
        commitId={selectedId}
        open={Boolean(selectedId)}
        onOpenChange={(open) => {
          if (!open) setSelectedId(null);
        }}
      />
    </div>
  );
}

export { CommitList };
