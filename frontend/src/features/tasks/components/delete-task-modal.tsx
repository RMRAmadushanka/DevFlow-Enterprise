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

import { useDeleteTask } from "../hooks/use-tasks";
import { deleteTaskSchema, type DeleteTaskFormValues } from "../schemas/task.schema";
import type { Task } from "../types/task.types";
import { toTaskErrorMessage } from "../utils/errors";

export interface DeleteTaskModalProps {
  task: Task | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function DeleteTaskModal({ task, open, onOpenChange }: DeleteTaskModalProps) {
  const remove = useDeleteTask();

  const form = useAppForm({
    schema: deleteTaskSchema,
    defaultValues: {
      confirmation: "",
    } satisfies DeleteTaskFormValues,
    onSubmit: async (values) => {
      if (!task) return;
      if (values.confirmation !== "DELETE") {
        form.setError("confirmation", { message: 'Type "DELETE" to confirm' });
        return;
      }
      await remove.mutateAsync(task.id);
      onOpenChange(false);
    },
  });

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Delete task?"
      description={
        task
          ? `Type DELETE to permanently remove ${task.key}: ${task.title}.`
          : undefined
      }
    >
      <AppForm form={form} className="gap-3">
        {form.submitError || remove.error ? (
          <AlertBanner
            tone="error"
            title="Delete failed"
            description={toTaskErrorMessage(form.submitError || remove.error)}
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
          Delete task
        </SubmitButton>
      </AppForm>
    </Modal>
  );
}

export { DeleteTaskModal };
