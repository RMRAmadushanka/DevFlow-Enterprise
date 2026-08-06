"use client";

import { Filter, X } from "lucide-react";

import { SelectField } from "@/components/forms/select";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  LANGUAGE_OPTIONS,
  STATUS_OPTIONS,
  TECHNOLOGY_OPTIONS,
  VISIBILITY_OPTIONS,
} from "../constants/project.constants";
import { useProjectStore } from "../store/project.store";
import type { ProjectStatus, ProjectVisibility } from "../types/project.types";

function ProjectFilters() {
  const filters = useProjectStore((s) => s.filters);
  const setFilters = useProjectStore((s) => s.setFilters);
  const resetFilters = useProjectStore((s) => s.resetFilters);

  const activeCount = [
    filters.status !== "all",
    filters.visibility !== "all",
    Boolean(filters.technology),
    Boolean(filters.language),
    filters.favoritesOnly,
    filters.archived === true || filters.archived === "all",
  ].filter(Boolean).length;

  return (
    <div className="flex flex-wrap items-center gap-2" data-slot="project-filters">
      <SelectField
        label="Status"
        value={filters.status}
        onValueChange={(value) => {
          if (value) setFilters({ status: value as ProjectStatus | "all" });
        }}
        options={STATUS_OPTIONS}
        className="w-[150px]"
        size="sm"
      />
      <SelectField
        label="Visibility"
        value={filters.visibility}
        onValueChange={(value) => {
          if (value) setFilters({ visibility: value as ProjectVisibility | "all" });
        }}
        options={VISIBILITY_OPTIONS}
        className="w-[150px]"
        size="sm"
      />
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button type="button" variant="outline" size="sm" aria-label="More filters" />
          }
        >
          <Filter className="size-4" />
          Filters
          {activeCount > 0 ? (
            <span className="rounded-full bg-muted px-1.5 text-xs tabular-nums">{activeCount}</span>
          ) : null}
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          <DropdownMenuLabel>Technology</DropdownMenuLabel>
          {TECHNOLOGY_OPTIONS.map((option) => (
            <DropdownMenuCheckboxItem
              key={option.value}
              checked={filters.technology === option.value}
              onCheckedChange={(checked) =>
                setFilters({ technology: checked ? option.value : null })
              }
            >
              {option.label}
            </DropdownMenuCheckboxItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuLabel>Language</DropdownMenuLabel>
          {LANGUAGE_OPTIONS.map((option) => (
            <DropdownMenuCheckboxItem
              key={option.value}
              checked={filters.language === option.value}
              onCheckedChange={(checked) =>
                setFilters({ language: checked ? option.value : null })
              }
            >
              {option.label}
            </DropdownMenuCheckboxItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuCheckboxItem
            checked={filters.favoritesOnly}
            onCheckedChange={(checked) => setFilters({ favoritesOnly: Boolean(checked) })}
          >
            Favorites only
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={filters.archived === true}
            onCheckedChange={(checked) =>
              setFilters({ archived: checked ? true : false })
            }
          >
            Show archived
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={filters.archived === "all"}
            onCheckedChange={(checked) =>
              setFilters({ archived: checked ? "all" : false })
            }
          >
            Include archived
          </DropdownMenuCheckboxItem>
        </DropdownMenuContent>
      </DropdownMenu>
      {activeCount > 0 ? (
        <Button type="button" variant="ghost" size="sm" onClick={resetFilters}>
          <X className="size-4" />
          Clear
        </Button>
      ) : null}
    </div>
  );
}

export { ProjectFilters };
