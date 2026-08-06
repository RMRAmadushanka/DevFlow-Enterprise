"use client";

import { FormModal } from "@/components/feedback/modal";

import type { Sprint } from "../types/sprint.types";
import { SprintForm } from "./sprint-form";

export interface EditSprintModalProps {
  sprint: Sprint | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function EditSprintModal({ sprint, open, onOpenChange }: EditSprintModalProps) {
  return (
    <FormModal
      open={open}
      onOpenChange={onOpenChange}
      title="Edit sprint"
      description={sprint ? `Update details for ${sprint.name}.` : undefined}
      submitLabel="Save changes"
      size="lg"
    >
      {sprint ? <SprintForm mode="edit" sprint={sprint} compact /> : null}
    </FormModal>
  );
}

export { EditSprintModal };
