"use client";

import { Modal } from "@/components/feedback/modal";
import {
  AppForm,
  FormController,
  useAppForm,
} from "@/components/forms/form-provider";
import { SelectField } from "@/components/forms/select";
import { SubmitButton } from "@/components/forms/form-actions";
import { AlertBanner } from "@/components/feedback/alert";

import { STATUS_OPTIONS } from "../constants/task.constants";
import { useMoveTask } from "../hooks/use-tasks";
import { moveTaskSchema, type MoveTaskFormValues } from "../schemas/task.schema";
import type { Task, TaskStatus } from "../types/task.types";
import { toTaskErrorMessage } from "../utils/errors";

const MOVE_STATUS_OPTIONS = STATUS_OPTIONS.filter(
  (option): option is { value: TaskStatus; label: string } => option.value !== "all"
);

export interface MoveTaskModalProps {
  task: Task | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function MoveTaskModal({ task, open, onOpenChange }: MoveTaskModalProps) {
  const move = useMoveTask();

  const form = useAppForm({
    schema: moveTaskSchema,
    defaultValues: {
      status: task?.status ?? "todo",
    } satisfies MoveTaskFormValues,
    onSubmit: async (values) => {
      if (!task) return;
      await move.mutateAsync({ id: task.id, status: values.status });
      onOpenChange(false);
    },
  });

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Move task"
      description={task ? `Change status for ${task.key}` : undefined}
    >
      <AppForm form={form} className="gap-3">
        {form.submitError || move.error ? (
          <AlertBanner
            tone="error"
            title="Move failed"
            description={toTaskErrorMessage(form.submitError || move.error)}
          />
        ) : null}
        <FormController
          name="status"
          control={form.control}
          render={({ field, fieldState }) => (
            <SelectField
              label="Status"
              options={[...MOVE_STATUS_OPTIONS]}
              value={field.value}
              onValueChange={field.onChange}
              error={fieldState.error?.message}
            />
          )}
        />
        <SubmitButton loading={form.isSubmitting || move.isPending} loadingText="Moving…">
          Move task
        </SubmitButton>
      </AppForm>
    </Modal>
  );
}

export { MoveTaskModal };
