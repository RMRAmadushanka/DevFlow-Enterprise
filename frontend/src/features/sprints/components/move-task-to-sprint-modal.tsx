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

import { useMoveBacklogToSprint, useSprints } from "../hooks/use-sprints";
import {
  moveTaskToSprintSchema,
  type MoveTaskToSprintFormValues,
} from "../schemas/sprint.schema";
import { toSprintErrorMessage } from "../utils/errors";

export interface MoveTaskToSprintModalProps {
  projectId: string;
  taskIds: string[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function MoveTaskToSprintModal({
  projectId,
  taskIds,
  open,
  onOpenChange,
}: MoveTaskToSprintModalProps) {
  const { data: sprintData } = useSprints(projectId);
  const move = useMoveBacklogToSprint(projectId);

  const sprintOptions = (sprintData?.items ?? [])
    .filter((s) => s.status === "planning" || s.status === "active")
    .map((s) => ({ value: s.id, label: s.name }));

  const form = useAppForm({
    schema: moveTaskToSprintSchema,
    defaultValues: {
      sprintId: sprintOptions[0]?.value ?? "",
      taskIds,
    } satisfies MoveTaskToSprintFormValues,
    onSubmit: async (values) => {
      await move.mutateAsync({ sprintId: values.sprintId, taskIds: values.taskIds });
      onOpenChange(false);
    },
  });

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Move to sprint"
      description={`Move ${taskIds.length} task${taskIds.length === 1 ? "" : "s"} to a sprint.`}
    >
      <AppForm form={form} className="gap-3">
        {form.submitError || move.error ? (
          <AlertBanner
            tone="error"
            title="Move failed"
            description={toSprintErrorMessage(form.submitError || move.error)}
          />
        ) : null}
        <FormController
          name="sprintId"
          control={form.control}
          render={({ field, fieldState }) => (
            <SelectField
              label="Sprint"
              options={sprintOptions}
              value={field.value}
              onValueChange={field.onChange}
              error={fieldState.error?.message}
            />
          )}
        />
        <SubmitButton loading={form.isSubmitting || move.isPending} loadingText="Moving…">
          Move tasks
        </SubmitButton>
      </AppForm>
    </Modal>
  );
}

export { MoveTaskToSprintModal };
