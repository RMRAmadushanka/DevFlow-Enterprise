"use client";

import { X } from "lucide-react";

import { SelectField } from "@/components/forms/select";
import { Button } from "@/components/ui/button";

import {
  AUTHOR_OPTIONS,
  FOLDER_OPTIONS,
  SORT_OPTIONS,
  VISIBILITY_OPTIONS,
} from "../constants/document.constants";
import { useDocumentStore } from "../store/document.store";
import type { DocumentSortField, DocumentVisibility } from "../types/document.types";

function DocumentFilters() {
  const filters = useDocumentStore((s) => s.filters);
  const sort = useDocumentStore((s) => s.sort);
  const setFilters = useDocumentStore((s) => s.setFilters);
  const setSort = useDocumentStore((s) => s.setSort);
  const resetFilters = useDocumentStore((s) => s.resetFilters);

  const activeCount = [
    filters.visibility !== "all",
    Boolean(filters.folderId),
    Boolean(filters.authorId),
    Boolean(filters.tag),
    filters.favoritesOnly,
    filters.sharedOnly,
  ].filter(Boolean).length;

  return (
    <div className="flex flex-wrap items-end gap-2" data-slot="document-filters">
      <SelectField
        label="Visibility"
        value={filters.visibility}
        onValueChange={(value) => {
          if (value) setFilters({ visibility: value as DocumentVisibility | "all" });
        }}
        options={VISIBILITY_OPTIONS}
        className="w-[160px]"
        size="sm"
      />
      <SelectField
        label="Folder"
        value={filters.folderId ?? "all"}
        onValueChange={(value) => {
          setFilters({ folderId: value === "all" ? null : value });
        }}
        options={[{ value: "all", label: "All folders" }, ...FOLDER_OPTIONS]}
        className="w-[160px]"
        size="sm"
      />
      <SelectField
        label="Author"
        value={filters.authorId ?? "all"}
        onValueChange={(value) => {
          setFilters({ authorId: value === "all" ? null : value });
        }}
        options={[{ value: "all", label: "All authors" }, ...AUTHOR_OPTIONS]}
        className="w-[160px]"
        size="sm"
      />
      <SelectField
        label="Sort"
        value={sort}
        onValueChange={(value) => {
          if (value) setSort(value as DocumentSortField);
        }}
        options={SORT_OPTIONS}
        className="w-[180px]"
        size="sm"
      />
      {activeCount > 0 ? (
        <Button type="button" variant="ghost" size="sm" onClick={resetFilters}>
          <X className="size-4" />
          Clear
        </Button>
      ) : null}
    </div>
  );
}

export { DocumentFilters };
