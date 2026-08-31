"use client";

import { Button } from "@/components/ui/button";
import { FormModal } from "@/components/feedback/modal";

import { TaskForm } from "./task-form";

const CREATE_TASK_FORM_ID = "create-task-form";

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
      size="lg"
      footer={
        <>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" form={CREATE_TASK_FORM_ID}>
            Create task
          </Button>
        </>
      }
    >
      <TaskForm mode="create" compact={compact} formId={CREATE_TASK_FORM_ID} hideSubmit />
    </FormModal>
  );
}

export { CreateTaskModal };
