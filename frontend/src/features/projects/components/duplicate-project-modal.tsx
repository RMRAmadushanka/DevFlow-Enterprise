"use client";

import * as React from "react";

import { Modal } from "@/components/feedback/modal";
import {
  AppForm,
  FormController,
  useAppForm,
  useAppFormWatch,
} from "@/components/forms/form-provider";
import { TextInput } from "@/components/forms/input";
import { SubmitButton } from "@/components/forms/form-actions";
import { AlertBanner } from "@/components/feedback/alert";

import { useDuplicateProject } from "../hooks/use-projects";
import {
  duplicateProjectSchema,
  type DuplicateProjectFormValues,
} from "../schemas/project.schema";
import type { Project } from "../types/project.types";
import { toProjectErrorMessage } from "../utils/errors";
import { deriveProjectKey } from "../utils/project-key";

export interface DuplicateProjectModalProps {
  project: Project | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function DuplicateProjectModal({ project, open, onOpenChange }: DuplicateProjectModalProps) {
  const duplicate = useDuplicateProject();
  const [keyTouched, setKeyTouched] = React.useState(false);

  const form = useAppForm({
    schema: duplicateProjectSchema,
    defaultValues: {
      name: project ? `${project.name} (Copy)` : "",
      key: project ? deriveProjectKey(`${project.name} Copy`) : "",
    } satisfies DuplicateProjectFormValues,
    onSubmit: async (values) => {
      if (!project) return;
      await duplicate.mutateAsync({
        id: project.id,
        name: values.name,
        key: values.key,
      });
      onOpenChange(false);
    },
  });

  const name = useAppFormWatch({ control: form.control, name: "name" });

  React.useEffect(() => {
    if (open && project) {
      form.reset({
        name: `${project.name} (Copy)`,
        key: deriveProjectKey(`${project.name} Copy`),
      });
      setKeyTouched(false);
    }
  }, [open, project, form]);

  React.useEffect(() => {
    if (!keyTouched && name) {
      form.setValue("key", deriveProjectKey(name), { shouldValidate: true });
    }
  }, [name, keyTouched, form]);

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Duplicate project"
      description="Create a copy with a new name and key. Settings and structure will be cloned."
    >
      <AppForm form={form} className="gap-3">
        {form.submitError || duplicate.error ? (
          <AlertBanner
            tone="error"
            title="Duplicate failed"
            description={toProjectErrorMessage(form.submitError || duplicate.error)}
          />
        ) : null}
        <FormController
          name="name"
          control={form.control}
          render={({ field, fieldState }) => (
            <TextInput
              {...field}
              label="Project name"
              required
              error={fieldState.error?.message}
            />
          )}
        />
        <FormController
          name="key"
          control={form.control}
          render={({ field, fieldState }) => (
            <TextInput
              {...field}
              label="Project key"
              required
              error={fieldState.error?.message}
              onChange={(value) => {
                setKeyTouched(true);
                field.onChange(value.toUpperCase());
              }}
            />
          )}
        />
        <SubmitButton
          loading={form.isSubmitting || duplicate.isPending}
          loadingText="Duplicating…"
        >
          Duplicate project
        </SubmitButton>
      </AppForm>
    </Modal>
  );
}

export { DuplicateProjectModal };
