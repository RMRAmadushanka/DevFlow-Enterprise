"use client";

import { SearchInput } from "@/components/forms/search-input";

import { useRepositoryStore } from "../store/repository.store";

export interface RepositorySearchProps {
  className?: string;
}

function RepositorySearch({ className }: RepositorySearchProps) {
  const q = useRepositoryStore((s) => s.filters.q);
  const setSearch = useRepositoryStore((s) => s.setSearch);

  return (
    <SearchInput
      value={q}
      onChange={setSearch}
      placeholder="Search repositories by name, org, language…"
      label="Search repositories"
      className={className}
    />
  );
}

export { RepositorySearch };
