"use client";

import { X } from "lucide-react";

import { SelectField } from "@/components/forms/select";
import { Button } from "@/components/ui/button";

import { PROJECT_OPTIONS, STATUS_OPTIONS } from "../constants/sprint.constants";
import { useSprintStore } from "../store/sprint.store";
import type { SprintStatus } from "../types/sprint.types";

function SprintFilters() {
  const filters = useSprintStore((s) => s.filters);
  const setFilters = useSprintStore((s) => s.setFilters);
  const resetFilters = useSprintStore((s) => s.resetFilters);

  const activeCount = [
    filters.status !== "all",
    Boolean(filters.projectId),
  ].filter(Boolean).length;

  return (
    <div className="flex flex-wrap items-center gap-2" data-slot="sprint-filters">
      <SelectField
        label="Status"
        value={filters.status}
        onValueChange={(value) => {
          if (value) setFilters({ status: value as SprintStatus | "all" });
        }}
        options={STATUS_OPTIONS}
        className="w-[150px]"
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
      {activeCount > 0 ? (
        <Button type="button" variant="ghost" size="sm" onClick={resetFilters}>
          <X className="size-4" />
          Clear
        </Button>
      ) : null}
    </div>
  );
}

export { SprintFilters };
