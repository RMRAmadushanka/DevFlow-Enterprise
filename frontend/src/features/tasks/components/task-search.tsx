"use client";

import { SearchInput } from "@/components/forms/search-input";

import { useTaskStore } from "../store/task.store";

export interface TaskSearchProps {
  className?: string;
}

function TaskSearch({ className }: TaskSearchProps) {
  const q = useTaskStore((s) => s.filters.q);
  const setSearch = useTaskStore((s) => s.setSearch);

  return (
    <SearchInput
      value={q}
      onChange={setSearch}
      placeholder="Search by title, key, assignee…"
      label="Search tasks"
      className={className}
    />
  );
}

export { TaskSearch };
