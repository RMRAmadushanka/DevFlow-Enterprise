"use client";

import { SelectField } from "@/components/forms/select";

import { SORT_OPTIONS } from "../constants/project.constants";
import { useProjectStore } from "../store/project.store";
import type { ProjectSortField } from "../types/project.types";

function ProjectSort() {
  const sort = useProjectStore((s) => s.sort);
  const setSort = useProjectStore((s) => s.setSort);

  return (
    <SelectField
      label="Sort"
      value={sort}
      onValueChange={(value) => {
        if (value) setSort(value as ProjectSortField);
      }}
      options={SORT_OPTIONS}
      className="w-[180px]"
      size="sm"
    />
  );
}

export { ProjectSort };
