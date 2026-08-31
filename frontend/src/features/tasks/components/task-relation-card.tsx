"use client";

import * as React from "react";
import Link from "next/link";
import { Trash2 } from "lucide-react";

import { SelectField } from "@/components/forms/select";
import { TextInput } from "@/components/forms/input";
import { Button } from "@/components/ui/button";
import { PermissionGuard } from "@/lib/permissions";
import { routes } from "@/config/routes";

import {
  useCreateTaskRelation,
  useDeleteTaskRelation,
  useTasks,
} from "../hooks/use-tasks";
import type { TaskRelation, TaskRelationType } from "../types/task.types";
import { TaskStatusBadge } from "./task-status-badge";

export interface TaskRelationCardProps {
  taskId: string;
  relations: TaskRelation[];
  onSelect?: (relation: TaskRelation) => void;
  readOnly?: boolean;
}

const RELATION_LABELS: Record<TaskRelation["type"], string> = {
  blocks: "Blocks",
  blocked_by: "Blocked by",
  related: "Related",
  duplicate: "Duplicate of",
  parent: "Parent",
  child: "Child",
};

const RELATION_OPTIONS = (Object.keys(RELATION_LABELS) as TaskRelationType[]).map(
  (value) => ({ value, label: RELATION_LABELS[value] })
);

function TaskRelationCard({
  taskId,
  relations,
  onSelect,
  readOnly,
}: TaskRelationCardProps) {
  const { data } = useTasks();
  const createRelation = useCreateTaskRelation(taskId);
  const deleteRelation = useDeleteTaskRelation(taskId);
  const [type, setType] = React.useState<TaskRelationType>("related");
  const [targetTaskId, setTargetTaskId] = React.useState("");
  const [search, setSearch] = React.useState("");

  const linkableTasks = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    return (data?.items ?? [])
      .filter((task) => task.id !== taskId)
      .filter((task) => !relations.some((relation) => relation.taskId === task.id))
      .filter((task) => {
        if (!q) return true;
        return (
          task.key.toLowerCase().includes(q) ||
          task.title.toLowerCase().includes(q)
        );
      })
      .slice(0, 20)
      .map((task) => ({
        value: task.id,
        label: `${task.key} — ${task.title}`,
      }));
  }, [data?.items, relations, search, taskId]);

  async function handleAdd() {
    if (!targetTaskId) return;
    await createRelation.mutateAsync({ type, targetTaskId });
    setTargetTaskId("");
    setSearch("");
  }

  return (
    <div className="space-y-4" data-slot="task-relation-card">
      {relations.length === 0 ? (
        <p className="text-sm text-muted-foreground">No linked tasks.</p>
      ) : (
        <ul className="divide-y divide-border rounded-lg border border-border">
          {relations.map((relation) => (
            <li key={relation.id} className="flex items-center gap-3 px-3 py-2.5">
              <span className="shrink-0 text-xs font-medium text-muted-foreground">
                {RELATION_LABELS[relation.type]}
              </span>
              <Link
                href={routes.app.task(relation.taskId)}
                className="shrink-0 font-mono text-xs text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50"
              >
                {relation.taskKey}
              </Link>
              <button
                type="button"
                className="min-w-0 flex-1 truncate text-left text-sm outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring/50"
                onClick={() => onSelect?.(relation)}
              >
                {relation.taskTitle}
              </button>
              <TaskStatusBadge status={relation.status} />
              {!readOnly ? (
                <PermissionGuard permission="task.update">
                  <Button
                    type="button"
                    size="icon-sm"
                    variant="ghost"
                    aria-label="Remove link"
                    onClick={() => void deleteRelation.mutateAsync(relation.id)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </PermissionGuard>
              ) : null}
            </li>
          ))}
        </ul>
      )}

      {!readOnly ? (
        <PermissionGuard permission="task.update">
          <div className="space-y-2 rounded-lg border border-border p-3">
            <SelectField
              label="Relation type"
              options={RELATION_OPTIONS}
              value={type}
              onValueChange={(value) => setType((value as TaskRelationType) || "related")}
            />
            <TextInput
              label="Search tasks"
              value={search}
              onChange={setSearch}
              placeholder="Filter by key or title"
            />
            <SelectField
              label="Task"
              options={[
                { value: "", label: "Select a task" },
                ...linkableTasks,
              ]}
              value={targetTaskId}
              onValueChange={(value) => setTargetTaskId(value ?? "")}
            />
            <Button
              type="button"
              size="sm"
              onClick={() => void handleAdd()}
              disabled={!targetTaskId || createRelation.isPending}
            >
              Link task
            </Button>
          </div>
        </PermissionGuard>
      ) : null}
    </div>
  );
}

export { TaskRelationCard };
