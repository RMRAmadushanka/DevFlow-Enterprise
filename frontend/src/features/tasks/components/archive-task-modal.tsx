"use client";

import { ConfirmModal } from "@/components/feedback/modal";

import { useArchiveTask } from "../hooks/use-tasks";
import type { Task } from "../types/task.types";

export interface ArchiveTaskModalProps {
  task: Task | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function ArchiveTaskModal({ task, open, onOpenChange }: ArchiveTaskModalProps) {
  const archive = useArchiveTask();

  return (
    <ConfirmModal
      open={open}
      onOpenChange={onOpenChange}
      title="Archive task?"
      description={
        task
          ? `${task.key} will be moved to archived status and hidden from active boards.`
          : undefined
      }
      confirmLabel="Archive"
      variant="danger"
      loading={archive.isPending}
      onConfirm={() => {
        if (!task) return;
        void archive.mutateAsync(task.id).then(() => onOpenChange(false));
      }}
    />
  );
}

export { ArchiveTaskModal };
