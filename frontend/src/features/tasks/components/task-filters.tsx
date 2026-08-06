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
  LABEL_CATALOG,
  PRIORITY_OPTIONS,
  PROJECT_OPTIONS,
  SPRINT_OPTIONS,
  STATUS_OPTIONS,
  USER_OPTIONS,
} from "../constants/task.constants";
import { useTaskStore } from "../store/task.store";
import type { TaskPriority, TaskStatus } from "../types/task.types";

function TaskFilters() {
  const filters = useTaskStore((s) => s.filters);
  const setFilters = useTaskStore((s) => s.setFilters);
  const resetFilters = useTaskStore((s) => s.resetFilters);

  const activeCount = [
    filters.status !== "all",
    filters.priority !== "all",
    Boolean(filters.projectId),
    Boolean(filters.sprintId),
    filters.myTasks,
    filters.overdue,
    Boolean(filters.assigneeId),
    Boolean(filters.label),
    filters.hasAttachments,
    filters.hasComments,
    filters.archived,
  ].filter(Boolean).length;

  return (
    <div className="flex flex-wrap items-center gap-2" data-slot="task-filters">
      <SelectField
        label="Status"
        value={filters.status}
        onValueChange={(value) => {
          if (value) setFilters({ status: value as TaskStatus | "all" });
        }}
        options={STATUS_OPTIONS}
        className="w-[150px]"
        size="sm"
      />
      <SelectField
        label="Priority"
        value={filters.priority}
        onValueChange={(value) => {
          if (value) setFilters({ priority: value as TaskPriority | "all" });
        }}
        options={PRIORITY_OPTIONS}
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
      <SelectField
        label="Sprint"
        value={filters.sprintId ?? "all"}
        onValueChange={(value) => {
          setFilters({ sprintId: value === "all" ? null : value });
        }}
        options={[{ value: "all", label: "All sprints" }, ...SPRINT_OPTIONS]}
        className="w-[140px]"
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
          <DropdownMenuCheckboxItem
            checked={filters.myTasks}
            onCheckedChange={(checked) => setFilters({ myTasks: Boolean(checked) })}
          >
            My tasks
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={filters.overdue}
            onCheckedChange={(checked) => setFilters({ overdue: Boolean(checked) })}
          >
            Overdue only
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={filters.archived}
            onCheckedChange={(checked) => setFilters({ archived: Boolean(checked) })}
          >
            Show archived
          </DropdownMenuCheckboxItem>
          <DropdownMenuSeparator />
          <DropdownMenuLabel>Assignee</DropdownMenuLabel>
          {USER_OPTIONS.map((option) => (
            <DropdownMenuCheckboxItem
              key={option.value}
              checked={filters.assigneeId === option.value}
              onCheckedChange={(checked) =>
                setFilters({ assigneeId: checked ? option.value : null })
              }
            >
              {option.label}
            </DropdownMenuCheckboxItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuLabel>Label</DropdownMenuLabel>
          {LABEL_CATALOG.map((label) => (
            <DropdownMenuCheckboxItem
              key={label.id}
              checked={filters.label === label.name}
              onCheckedChange={(checked) =>
                setFilters({ label: checked ? label.name : null })
              }
            >
              {label.name}
            </DropdownMenuCheckboxItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuCheckboxItem
            checked={filters.hasAttachments}
            onCheckedChange={(checked) => setFilters({ hasAttachments: Boolean(checked) })}
          >
            Has attachments
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={filters.hasComments}
            onCheckedChange={(checked) => setFilters({ hasComments: Boolean(checked) })}
          >
            Has comments
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

export { TaskFilters };
