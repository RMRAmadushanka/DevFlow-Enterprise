"use client";

import { cn } from "@/lib/utils";

import type { Repository as RepositoryEntity } from "../types/repository.types";
import { RepositoryCard } from "./repository-card";
import {
  RepositoryEmptyState,
  type RepositoryEmptyVariant,
} from "./repository-empty-state";
import { RepositoryGridSkeleton } from "./repository-skeleton";

export interface RepositoryGridProps {
  repositories: RepositoryEntity[];
  loading?: boolean;
  emptyVariant?: RepositoryEmptyVariant;
  onArchive?: (repository: RepositoryEntity) => void;
  onTransfer?: (repository: RepositoryEntity) => void;
  onDelete?: (repository: RepositoryEntity) => void;
  className?: string;
}

function RepositoryGrid({
  repositories,
  loading,
  emptyVariant = "no-repositories",
  onArchive,
  onTransfer,
  onDelete,
  className,
}: RepositoryGridProps) {
  if (loading) return <RepositoryGridSkeleton />;

  if (repositories.length === 0) {
    return <RepositoryEmptyState variant={emptyVariant} />;
  }

  return (
    <div
      className={cn("grid gap-4 sm:grid-cols-2 xl:grid-cols-3", className)}
      data-slot="repository-grid"
    >
      {repositories.map((repository) => (
        <RepositoryCard
          key={repository.id}
          repository={repository}
          onArchive={onArchive}
          onTransfer={onTransfer}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}

export { RepositoryGrid };
