"use client";

import { Modal } from "@/components/feedback/modal";
import {
  AppForm,
  FormController,
  useAppForm,
} from "@/components/forms/form-provider";
import { TextInput } from "@/components/forms/input";
import { CheckboxField } from "@/components/forms/checkbox";
import { SubmitButton } from "@/components/forms/form-actions";
import { AlertBanner } from "@/components/feedback/alert";

import { useCompleteSprint } from "../hooks/use-sprints";
import {
  completeSprintSchema,
  type CompleteSprintFormValues,
} from "../schemas/sprint.schema";
import type { Sprint } from "../types/sprint.types";
import { toSprintErrorMessage } from "../utils/errors";

export interface CompleteSprintModalProps {
  sprint: Sprint | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function CompleteSprintModal({ sprint, open, onOpenChange }: CompleteSprintModalProps) {
  const complete = useCompleteSprint();

  const form = useAppForm({
    schema: completeSprintSchema,
    defaultValues: {
      moveIncompleteToBacklog: true,
      confirmation: "",
    } satisfies CompleteSprintFormValues,
    onSubmit: async (values) => {
      if (!sprint) return;
      if (values.confirmation !== "COMPLETE") {
        form.setError("confirmation", { message: 'Type "COMPLETE" to confirm' });
        return;
      }
      await complete.mutateAsync(sprint.id);
      onOpenChange(false);
    },
  });

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Complete sprint?"
      description={
        sprint
          ? `Mark ${sprint.name} as completed. Incomplete tasks can be moved back to the backlog.`
          : undefined
      }
    >
      <AppForm form={form} className="gap-3">
        {form.submitError || complete.error ? (
          <AlertBanner
            tone="error"
            title="Could not complete sprint"
            description={toSprintErrorMessage(form.submitError || complete.error)}
          />
        ) : null}
        <FormController
          name="moveIncompleteToBacklog"
          control={form.control}
          render={({ field }) => (
            <CheckboxField
              label="Move incomplete tasks to backlog"
              checked={field.value}
              onCheckedChange={field.onChange}
            />
          )}
        />
        <FormController
          name="confirmation"
          control={form.control}
          render={({ field, fieldState }) => (
            <TextInput
              {...field}
              label='Type "COMPLETE" to confirm'
              placeholder="COMPLETE"
              error={fieldState.error?.message}
            />
          )}
        />
        <SubmitButton
          loading={form.isSubmitting || complete.isPending}
          loadingText="Completing…"
        >
          Complete sprint
        </SubmitButton>
      </AppForm>
    </Modal>
  );
}

export { CompleteSprintModal };
