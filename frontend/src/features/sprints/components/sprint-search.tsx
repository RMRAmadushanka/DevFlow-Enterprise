"use client";

import { SearchInput } from "@/components/forms/search-input";

import { useSprintStore } from "../store/sprint.store";

export interface SprintSearchProps {
  className?: string;
}

function SprintSearch({ className }: SprintSearchProps) {
  const q = useSprintStore((s) => s.filters.q);
  const setSearch = useSprintStore((s) => s.setSearch);

  return (
    <SearchInput
      value={q}
      onChange={setSearch}
      placeholder="Search sprints by name, goal, project…"
      label="Search sprints"
      className={className}
    />
  );
}

export { SprintSearch };
