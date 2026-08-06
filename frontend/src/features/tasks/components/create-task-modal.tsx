"use client";

import { FormModal } from "@/components/feedback/modal";

import { TaskForm } from "./task-form";

export interface CreateTaskModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  compact?: boolean;
}

function CreateTaskModal({ open, onOpenChange, compact }: CreateTaskModalProps) {
  return (
    <FormModal
      open={open}
      onOpenChange={onOpenChange}
      title="Create task"
      description="Add a new task to your project backlog."
      submitLabel="Create task"
      size="lg"
    >
      <TaskForm mode="create" compact={compact} />
    </FormModal>
  );
}

export { CreateTaskModal };
