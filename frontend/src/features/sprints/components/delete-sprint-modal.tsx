"use client";

import { Modal } from "@/components/feedback/modal";
import {
  AppForm,
  FormController,
  useAppForm,
} from "@/components/forms/form-provider";
import { TextInput } from "@/components/forms/input";
import { SubmitButton } from "@/components/forms/form-actions";
import { AlertBanner } from "@/components/feedback/alert";

import { useDeleteSprint } from "../hooks/use-sprints";
import { deleteSprintSchema, type DeleteSprintFormValues } from "../schemas/sprint.schema";
import type { Sprint } from "../types/sprint.types";
import { toSprintErrorMessage } from "../utils/errors";

export interface DeleteSprintModalProps {
  sprint: Sprint | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function DeleteSprintModal({ sprint, open, onOpenChange }: DeleteSprintModalProps) {
  const remove = useDeleteSprint();

  const form = useAppForm({
    schema: deleteSprintSchema,
    defaultValues: {
      confirmation: "",
    } satisfies DeleteSprintFormValues,
    onSubmit: async (values) => {
      if (!sprint) return;
      if (values.confirmation !== "DELETE") {
        form.setError("confirmation", { message: 'Type "DELETE" to confirm' });
        return;
      }
      await remove.mutateAsync(sprint.id);
      onOpenChange(false);
    },
  });

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Delete sprint?"
      description={
        sprint
          ? `Type DELETE to permanently remove ${sprint.name}. This action cannot be undone.`
          : undefined
      }
    >
      <AppForm form={form} className="gap-3">
        {form.submitError || remove.error ? (
          <AlertBanner
            tone="error"
            title="Delete failed"
            description={toSprintErrorMessage(form.submitError || remove.error)}
          />
        ) : null}
        <FormController
          name="confirmation"
          control={form.control}
          render={({ field, fieldState }) => (
            <TextInput
              {...field}
              label='Type "DELETE" to confirm'
              placeholder="DELETE"
              error={fieldState.error?.message}
            />
          )}
        />
        <SubmitButton
          loading={form.isSubmitting || remove.isPending}
          loadingText="Deleting…"
          variant="destructive"
        >
          Delete sprint
        </SubmitButton>
      </AppForm>
    </Modal>
  );
}

export { DeleteSprintModal };
