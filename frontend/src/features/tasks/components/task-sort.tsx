"use client";

import { SelectField } from "@/components/forms/select";

import { SORT_OPTIONS } from "../constants/task.constants";
import { useTaskStore } from "../store/task.store";
import type { TaskSortField } from "../types/task.types";

function TaskSort() {
  const sort = useTaskStore((s) => s.sort);
  const setSort = useTaskStore((s) => s.setSort);

  return (
    <SelectField
      label="Sort"
      value={sort}
      onValueChange={(value) => {
        if (value) setSort(value as TaskSortField);
      }}
      options={SORT_OPTIONS}
      className="w-[180px]"
      size="sm"
    />
  );
}

export { TaskSort };
