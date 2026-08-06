"use client";

import { X } from "lucide-react";

import { SelectField } from "@/components/forms/select";
import { SwitchField } from "@/components/forms/switch";
import { Button } from "@/components/ui/button";

import {
  LANGUAGE_OPTIONS,
  PROJECT_OPTIONS,
  PROVIDER_OPTIONS,
  STATUS_OPTIONS,
  VISIBILITY_OPTIONS,
} from "../constants/repository.constants";
import { useRepositoryStore } from "../store/repository.store";
import type {
  RepositoryProvider,
  RepositoryVisibility,
} from "../types/repository.types";

function RepositoryFilters() {
  const filters = useRepositoryStore((s) => s.filters);
  const setFilters = useRepositoryStore((s) => s.setFilters);
  const resetFilters = useRepositoryStore((s) => s.resetFilters);

  const activeCount = [
    filters.visibility !== "all",
    filters.provider !== "all",
    filters.status !== "all",
    Boolean(filters.language),
    Boolean(filters.projectId),
    filters.favoritesOnly,
    filters.archivedOnly,
  ].filter(Boolean).length;

  return (
    <div className="flex flex-wrap items-center gap-2" data-slot="repository-filters">
      <SelectField
        label="Visibility"
        value={filters.visibility}
        onValueChange={(value) => {
          if (value) setFilters({ visibility: value as RepositoryVisibility | "all" });
        }}
        options={VISIBILITY_OPTIONS}
        className="w-[150px]"
        size="sm"
      />
      <SelectField
        label="Provider"
        value={filters.provider}
        onValueChange={(value) => {
          if (value) setFilters({ provider: value as RepositoryProvider | "all" });
        }}
        options={PROVIDER_OPTIONS}
        className="w-[160px]"
        size="sm"
      />
      <SelectField
        label="Language"
        value={filters.language ?? "all"}
        onValueChange={(value) => {
          setFilters({ language: value === "all" ? null : value });
        }}
        options={[{ value: "all", label: "All languages" }, ...LANGUAGE_OPTIONS]}
        className="w-[160px]"
        size="sm"
      />
      <SelectField
        label="Status"
        value={filters.status}
        onValueChange={(value) => {
          if (value) {
            setFilters({
              status: value as "all" | "active" | "archived",
              archivedOnly: value === "archived",
            });
          }
        }}
        options={STATUS_OPTIONS}
        className="w-[140px]"
        size="sm"
      />
      <SelectField
        label="Project"
        value={filters.projectId ?? "all"}
        onValueChange={(value) => {
          setFilters({ projectId: value === "all" ? null : value });
        }}
        options={[{ value: "all", label: "All projects" }, ...PROJECT_OPTIONS]}
        className="w-[160px]"
        size="sm"
      />
      <SwitchField
        label="Favorites only"
        checked={filters.favoritesOnly}
        onCheckedChange={(checked) => setFilters({ favoritesOnly: Boolean(checked) })}
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

export { RepositoryFilters };
