"use client";

import { FormModal } from "@/components/feedback/modal";

import { SprintForm } from "./sprint-form";

export interface CreateSprintModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultProjectId?: string;
}

function CreateSprintModal({ open, onOpenChange, defaultProjectId }: CreateSprintModalProps) {
  return (
    <FormModal
      open={open}
      onOpenChange={onOpenChange}
      title="Create sprint"
      description="Plan a new iteration for your team."
      submitLabel="Create sprint"
      size="lg"
    >
      <SprintForm mode="create" defaultProjectId={defaultProjectId} compact />
    </FormModal>
  );
}

export { CreateSprintModal };
