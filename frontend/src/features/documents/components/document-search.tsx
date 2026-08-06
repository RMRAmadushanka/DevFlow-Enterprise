"use client";

import { SearchInput } from "@/components/forms/search-input";

import { useDocumentStore } from "../store/document.store";

export interface DocumentSearchProps {
  className?: string;
}

function DocumentSearch({ className }: DocumentSearchProps) {
  const q = useDocumentStore((s) => s.filters.q);
  const setSearch = useDocumentStore((s) => s.setSearch);

  return (
    <SearchInput
      value={q}
      onChange={setSearch}
      placeholder="Search documents by title, tag, owner…"
      label="Search documents"
      className={className}
    />
  );
}

export { DocumentSearch };
