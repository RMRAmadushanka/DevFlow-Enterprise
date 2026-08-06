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

import { useDeleteProject } from "../hooks/use-projects";
import {
  deleteProjectSchema,
  type DeleteProjectFormValues,
} from "../schemas/project.schema";
import type { Project } from "../types/project.types";
import { toProjectErrorMessage } from "../utils/errors";

export interface DeleteProjectModalProps {
  project: Project | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function DeleteProjectModal({ project, open, onOpenChange }: DeleteProjectModalProps) {
  const remove = useDeleteProject();

  const form = useAppForm({
    schema: deleteProjectSchema,
    defaultValues: {
      confirmation: "",
    } satisfies DeleteProjectFormValues,
    onSubmit: async (values) => {
      if (!project) return;
      if (values.confirmation !== project.key) {
        form.setError("confirmation", { message: "Project key does not match" });
        return;
      }
      await remove.mutateAsync({ id: project.id, confirmation: values.confirmation });
      onOpenChange(false);
    },
  });

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Delete project?"
      description={
        project
          ? `Type the project key “${project.key}” to permanently delete ${project.name}.`
          : undefined
      }
    >
      <AppForm form={form} className="gap-3">
        {form.submitError || remove.error ? (
          <AlertBanner
            tone="error"
            title="Delete failed"
            description={toProjectErrorMessage(form.submitError || remove.error)}
          />
        ) : null}
        <FormController
          name="confirmation"
          control={form.control}
          render={({ field, fieldState }) => (
            <TextInput
              {...field}
              label="Project key"
              placeholder={project?.key}
              error={fieldState.error?.message}
            />
          )}
        />
        <SubmitButton
          loading={form.isSubmitting || remove.isPending}
          loadingText="Deleting…"
          variant="destructive"
        >
          Delete forever
        </SubmitButton>
      </AppForm>
    </Modal>
  );
}

export { DeleteProjectModal };
