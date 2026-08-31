"use client";

import { Button } from "@/components/ui/button";
import { FormModal } from "@/components/feedback/modal";

import { SprintForm } from "./sprint-form";

const CREATE_SPRINT_FORM_ID = "create-sprint-form";

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
      size="lg"
      footer={
        <>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" form={CREATE_SPRINT_FORM_ID}>
            Create sprint
          </Button>
        </>
      }
    >
      <SprintForm
        mode="create"
        defaultProjectId={defaultProjectId}
        compact
        formId={CREATE_SPRINT_FORM_ID}
        hideSubmit
      />
    </FormModal>
  );
}

export { CreateSprintModal };
