"use client";

import * as React from "react";
import { Check, Pencil, Plus, Trash2, X } from "lucide-react";

import { ProgressBar } from "@/components/data-display/progress";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { TextInput } from "@/components/forms/input";
import { PermissionGuard } from "@/lib/permissions";

import { useUpdateChecklist } from "../hooks/use-tasks";
import type { TaskChecklistItem } from "../types/task.types";
import { checklistProgress } from "../utils/format";
import { TaskEmptyState } from "./task-empty-state";

export interface TaskChecklistProps {
  taskId: string;
  items: TaskChecklistItem[];
  readOnly?: boolean;
}

function TaskChecklist({ taskId, items, readOnly }: TaskChecklistProps) {
  const updateChecklist = useUpdateChecklist(taskId);
  const [draft, setDraft] = React.useState("");
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editTitle, setEditTitle] = React.useState("");

  const progress = checklistProgress(
    items.filter((item) => item.completed).length,
    items.length
  );

  async function persist(next: TaskChecklistItem[]) {
    await updateChecklist.mutateAsync(next);
  }

  async function handleAdd() {
    const title = draft.trim();
    if (!title) return;
    await persist([...items, { id: crypto.randomUUID(), title, completed: false }]);
    setDraft("");
  }

  async function handleToggle(item: TaskChecklistItem) {
    await persist(
      items.map((entry) =>
        entry.id === item.id ? { ...entry, completed: !entry.completed } : entry
      )
    );
  }

  async function handleDelete(id: string) {
    await persist(items.filter((entry) => entry.id !== id));
  }

  async function handleSaveEdit(id: string) {
    const title = editTitle.trim();
    if (!title) return;
    await persist(items.map((entry) => (entry.id === id ? { ...entry, title } : entry)));
    setEditingId(null);
    setEditTitle("");
  }

  if (items.length === 0 && readOnly) {
    return <TaskEmptyState variant="no-checklist" />;
  }

  return (
    <div className="space-y-4" data-slot="task-checklist">
      {items.length > 0 ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Progress</span>
            <span className="tabular-nums">{progress}%</span>
          </div>
          <ProgressBar value={progress} showValue={false} animated={false} />
        </div>
      ) : null}

      <ul className="space-y-2" aria-label="Checklist">
        {items.map((item) => (
          <li key={item.id} className="flex items-center gap-2">
            <Checkbox
              checked={item.completed}
              disabled={readOnly || updateChecklist.isPending}
              onCheckedChange={() => void handleToggle(item)}
              aria-label={item.title}
            />
            {editingId === item.id ? (
              <>
                <TextInput
                  value={editTitle}
                  onChange={setEditTitle}
                  label="Edit checklist item"
                  className="flex-1"
                />
                <Button type="button" size="icon-sm" onClick={() => void handleSaveEdit(item.id)}>
                  <Check className="size-4" />
                </Button>
                <Button
                  type="button"
                  size="icon-sm"
                  variant="ghost"
                  onClick={() => setEditingId(null)}
                >
                  <X className="size-4" />
                </Button>
              </>
            ) : (
              <>
                <span
                  className={item.completed ? "flex-1 text-sm text-muted-foreground line-through" : "flex-1 text-sm"}
                >
                  {item.title}
                </span>
                {!readOnly ? (
                  <PermissionGuard permission="task.update">
                    <Button
                      type="button"
                      size="icon-sm"
                      variant="ghost"
                      aria-label={`Edit ${item.title}`}
                      onClick={() => {
                        setEditingId(item.id);
                        setEditTitle(item.title);
                      }}
                    >
                      <Pencil className="size-4" />
                    </Button>
                    <Button
                      type="button"
                      size="icon-sm"
                      variant="ghost"
                      aria-label={`Delete ${item.title}`}
                      onClick={() => void handleDelete(item.id)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </PermissionGuard>
                ) : null}
              </>
            )}
          </li>
        ))}
      </ul>

      {!readOnly ? (
        <PermissionGuard permission="task.update">
          <div className="flex items-end gap-2">
            <div
              className="flex-1"
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  void handleAdd();
                }
              }}
            >
              <TextInput
                value={draft}
                onChange={setDraft}
                label="New checklist item"
                placeholder="Add an item…"
              />
            </div>
            <Button type="button" size="sm" onClick={() => void handleAdd()}>
              <Plus className="size-4" />
              Add
            </Button>
          </div>
        </PermissionGuard>
      ) : null}
    </div>
  );
}

export { TaskChecklist };
