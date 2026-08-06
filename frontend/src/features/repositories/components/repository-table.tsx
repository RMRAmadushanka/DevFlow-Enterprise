"use client";

import * as React from "react";
import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import { Star } from "lucide-react";

import { StatusBadge } from "@/components/data-display/badges";
import type { Tone } from "@/components/data-display/shared/types";
import { DataTable } from "@/components/data-display/table";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { routes } from "@/config/routes";

import {
  HEALTH_LABELS,
  PROVIDER_LABELS,
  VISIBILITY_LABELS,
} from "../constants/repository.constants";
import { useToggleRepositoryFavorite } from "../hooks/use-repositories";
import type {
  Repository as RepositoryEntity,
  RepositoryHealth,
} from "../types/repository.types";
import { formatRelativeCommitDate, formatRepoSize } from "../utils/format";
import {
  RepositoryEmptyState,
  type RepositoryEmptyVariant,
} from "./repository-empty-state";
import { RepositoryQuickActions } from "./repository-quick-actions";
import { RepositoryTableSkeleton } from "./repository-skeleton";

const HEALTH_TONE: Record<RepositoryHealth, Tone> = {
  healthy: "success",
  at_risk: "warning",
  critical: "danger",
  unknown: "neutral",
};

export interface RepositoryTableProps {
  repositories: RepositoryEntity[];
  loading?: boolean;
  emptyVariant?: RepositoryEmptyVariant;
  onArchive?: (repository: RepositoryEntity) => void;
  onTransfer?: (repository: RepositoryEntity) => void;
  onDelete?: (repository: RepositoryEntity) => void;
}

function FavoriteCell({ repository }: { repository: RepositoryEntity }) {
  const favorite = useToggleRepositoryFavorite();
  return (
    <Button
      type="button"
      size="icon-sm"
      variant="ghost"
      aria-label={repository.favorited ? "Remove favorite" : "Add favorite"}
      aria-pressed={repository.favorited}
      onClick={() => void favorite.mutateAsync(repository.id)}
    >
      <Star
        className={cn("size-4", repository.favorited && "fill-warning text-warning")}
      />
    </Button>
  );
}

function RepositoryTable({
  repositories,
  loading,
  emptyVariant = "no-repositories",
  onArchive,
  onTransfer,
  onDelete,
}: RepositoryTableProps) {
  const columns = React.useMemo<ColumnDef<RepositoryEntity>[]>(
    () => [
      {
        id: "favorite",
        header: "",
        cell: ({ row }) => <FavoriteCell repository={row.original} />,
        size: 40,
      },
      {
        accessorKey: "name",
        header: "Repository",
        cell: ({ row }) => (
          <div className="min-w-0">
            <Link
              href={routes.app.repository(row.original.id)}
              className="font-medium text-foreground outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring/50"
            >
              {row.original.name}
            </Link>
            <p className="truncate text-xs text-muted-foreground">
              {row.original.organization}
            </p>
          </div>
        ),
      },
      {
        accessorKey: "visibility",
        header: "Visibility",
        cell: ({ row }) => (
          <StatusBadge tone="neutral" size="sm" dot>
            {VISIBILITY_LABELS[row.original.visibility]}
          </StatusBadge>
        ),
      },
      {
        accessorKey: "primaryLanguage",
        header: "Language",
        cell: ({ getValue }) => (
          <span className="text-sm text-muted-foreground">
            {String(getValue() || "—")}
          </span>
        ),
      },
      {
        accessorKey: "defaultBranch",
        header: "Branch",
      },
      {
        accessorKey: "sizeKb",
        header: "Size",
        cell: ({ row }) => (
          <span className="tabular-nums text-sm">
            {formatRepoSize(row.original.sizeKb)}
          </span>
        ),
      },
      {
        accessorKey: "openPullRequests",
        header: "PRs",
        cell: ({ getValue }) => (
          <span className="tabular-nums text-sm">{String(getValue() ?? 0)}</span>
        ),
      },
      {
        id: "health",
        header: "Health",
        cell: ({ row }) => (
          <StatusBadge tone={HEALTH_TONE[row.original.health]} size="sm" dot>
            {HEALTH_LABELS[row.original.health]}
          </StatusBadge>
        ),
      },
      {
        accessorKey: "provider",
        header: "Provider",
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {PROVIDER_LABELS[row.original.provider]}
          </span>
        ),
      },
      {
        accessorKey: "lastCommitAt",
        header: "Updated",
        cell: ({ row }) => (
          <time
            className="text-sm text-muted-foreground"
            dateTime={row.original.lastCommitAt}
          >
            {row.original.lastCommitAt
              ? formatRelativeCommitDate(row.original.lastCommitAt)
              : "—"}
          </time>
        ),
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <RepositoryQuickActions
            repository={row.original}
            onArchive={onArchive}
            onTransfer={onTransfer}
            onDelete={onDelete}
            compact
          />
        ),
      },
    ],
    [onArchive, onTransfer, onDelete]
  );

  if (loading) return <RepositoryTableSkeleton />;

  if (repositories.length === 0) {
    return <RepositoryEmptyState variant={emptyVariant} />;
  }

  return (
    <DataTable
      columns={columns}
      data={repositories}
      getRowId={(row) => row.id}
      enablePagination={repositories.length > 10}
    />
  );
}

export { RepositoryTable };
