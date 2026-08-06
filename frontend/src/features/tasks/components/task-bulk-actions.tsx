"use client";

import { Archive, Trash2, UserRound } from "lucide-react";

import { SelectField } from "@/components/forms/select";
import { Button } from "@/components/ui/button";
import { PermissionGuard } from "@/lib/permissions";

import {
  PRIORITY_OPTIONS,
  STATUS_OPTIONS,
  USER_OPTIONS,
} from "../constants/task.constants";
import { useBulkUpdateTasks } from "../hooks/use-tasks";
import type { TaskPriority, TaskStatus } from "../types/task.types";

export interface TaskBulkActionsProps {
  selectedIds: string[];
  onClearSelection?: () => void;
  onArchive?: (ids: string[]) => void;
  onDelete?: (ids: string[]) => void;
}

const BULK_STATUS_OPTIONS = STATUS_OPTIONS.filter(
  (option): option is { value: TaskStatus; label: string } => option.value !== "all"
);

const BULK_PRIORITY_OPTIONS = PRIORITY_OPTIONS.filter(
  (option): option is { value: TaskPriority; label: string } => option.value !== "all"
);

function TaskBulkActions({
  selectedIds,
  onClearSelection,
  onArchive,
  onDelete,
}: TaskBulkActionsProps) {
  const bulkUpdate = useBulkUpdateTasks();

  if (selectedIds.length === 0) return null;

  async function assign(assigneeId: string) {
    await bulkUpdate.mutateAsync({ taskIds: selectedIds, assigneeId });
    onClearSelection?.();
  }

  async function setStatus(status: TaskStatus) {
    await bulkUpdate.mutateAsync({ taskIds: selectedIds, status });
    onClearSelection?.();
  }

  async function setPriority(priority: TaskPriority) {
    await bulkUpdate.mutateAsync({ taskIds: selectedIds, priority });
    onClearSelection?.();
  }

  return (
    <div
      className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2"
      data-slot="task-bulk-actions"
      role="toolbar"
      aria-label="Bulk task actions"
    >
      <span className="text-sm font-medium tabular-nums">{selectedIds.length} selected</span>

      <PermissionGuard permission="task.update">
        <SelectField
          label="Assign to"
          placeholder="Assign…"
          options={USER_OPTIONS}
          value=""
          onValueChange={(value) => {
            if (value) void assign(value);
          }}
          className="w-[160px]"
          size="sm"
        />
        <SelectField
          label="Set status"
          placeholder="Status…"
          options={BULK_STATUS_OPTIONS}
          value=""
          onValueChange={(value) => {
            if (value) void setStatus(value as TaskStatus);
          }}
          className="w-[140px]"
          size="sm"
        />
        <SelectField
          label="Set priority"
          placeholder="Priority…"
          options={BULK_PRIORITY_OPTIONS}
          value=""
          onValueChange={(value) => {
            if (value) void setPriority(value as TaskPriority);
          }}
          className="w-[140px]"
          size="sm"
        />
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => {
            if (onArchive) {
              onArchive(selectedIds);
            } else {
              void bulkUpdate
                .mutateAsync({ taskIds: selectedIds, archived: true, status: "archived" })
                .then(() => onClearSelection?.());
            }
          }}
        >
          <Archive className="size-4" />
          Archive
        </Button>
      </PermissionGuard>

      <PermissionGuard permission="task.delete">
        <Button
          type="button"
          size="sm"
          variant="destructive"
          onClick={() => onDelete?.(selectedIds)}
        >
          <Trash2 className="size-4" />
          Delete
        </Button>
      </PermissionGuard>

      <Button type="button" size="sm" variant="ghost" onClick={onClearSelection}>
        <UserRound className="size-4" />
        Clear
      </Button>
    </div>
  );
}

export { TaskBulkActions };
