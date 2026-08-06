"use client";

import * as React from "react";

import { SearchInput } from "@/components/forms/search-input";

import { useBranches } from "../hooks/use-repositories";
import type { Branch } from "../types/repository.types";
import { BranchCard } from "./branch-card";
import { BranchSkeleton } from "./repository-skeleton";
import { RepositoryEmptyState } from "./repository-empty-state";

export interface BranchListProps {
  repositoryId: string;
  onSelect?: (branch: Branch) => void;
  selectedName?: string | null;
}

function BranchList({ repositoryId, onSelect, selectedName }: BranchListProps) {
  const [q, setQ] = React.useState("");
  const { data: branches = [], isLoading, isError } = useBranches(repositoryId, q);

  return (
    <div className="flex flex-col gap-4" data-slot="branch-list">
      <SearchInput
        value={q}
        onChange={setQ}
        placeholder="Search branches…"
        label="Search branches"
        className="max-w-md"
      />
      {isLoading ? (
        <div className="flex flex-col gap-3">
          <BranchSkeleton />
          <BranchSkeleton />
          <BranchSkeleton />
        </div>
      ) : null}
      {!isLoading && (isError || branches.length === 0) ? (
        <RepositoryEmptyState variant="no-branches" />
      ) : null}
      {!isLoading && branches.length > 0 ? (
        <div className="flex flex-col gap-3">
          {branches.map((branch) => (
            <BranchCard
              key={branch.id}
              branch={branch}
              selected={selectedName === branch.name}
              onSelect={onSelect}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

export { BranchList };
