"use client";

import { SelectField } from "@/components/forms/select";

import { useBranches } from "../hooks/use-repositories";
import { useRepositoryStore } from "../store/repository.store";

export interface BranchSelectorProps {
  repositoryId: string;
  value?: string | null;
  onValueChange?: (branch: string | null) => void;
  className?: string;
  label?: string;
}

function BranchSelector({
  repositoryId,
  value,
  onValueChange,
  className,
  label = "Branch",
}: BranchSelectorProps) {
  const { data: branches = [], isLoading } = useBranches(repositoryId);
  const selectedBranch = useRepositoryStore((s) => s.selectedBranch);
  const setSelectedBranch = useRepositoryStore((s) => s.setSelectedBranch);

  const current = value ?? selectedBranch ?? branches.find((b) => b.isDefault)?.name ?? "";

  const options = branches.map((b) => ({
    value: b.name,
    label: b.isDefault ? `${b.name} (default)` : b.name,
  }));

  return (
    <SelectField
      label={label}
      value={current || undefined}
      onValueChange={(next) => {
        const branch = next || null;
        if (onValueChange) onValueChange(branch);
        else setSelectedBranch(branch);
      }}
      options={options}
      placeholder={isLoading ? "Loading…" : "Select branch"}
      className={className ?? "w-[200px]"}
      size="sm"
      disabled={isLoading || options.length === 0}
    />
  );
}

export { BranchSelector };
