"use client";

import { SearchInput } from "@/components/forms/search-input";

import { useProjectStore } from "../store/project.store";

export interface ProjectSearchProps {
  className?: string;
}

function ProjectSearch({ className }: ProjectSearchProps) {
  const q = useProjectStore((s) => s.filters.q);
  const setSearch = useProjectStore((s) => s.setSearch);

  return (
    <SearchInput
      value={q}
      onChange={setSearch}
      placeholder="Search by name, owner, repository, tags…"
      label="Search projects"
      className={className}
    />
  );
}

export { ProjectSearch };
