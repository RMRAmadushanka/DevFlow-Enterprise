"use client";

import * as React from "react";

import {
  AppForm,
  FormController,
  useAppForm,
} from "@/components/forms/form-provider";
import { TextInput } from "@/components/forms/input";
import { TextareaField } from "@/components/forms/textarea";
import { SelectField } from "@/components/forms/select";
import { TagsInputField } from "@/components/forms/tags-input";
import { SubmitButton } from "@/components/forms/form-actions";
import { AlertBanner } from "@/components/feedback/alert";
import { Button } from "@/components/ui/button";
import { PermissionGuard } from "@/lib/permissions";

import {
  TIMEZONE_OPTIONS,
  VISIBILITY_OPTIONS,
} from "../constants/project.constants";
import { useUpdateProject } from "../hooks/use-projects";
import {
  projectSettingsSchema,
  type ProjectSettingsFormValues,
} from "../schemas/project.schema";
import type { Project } from "../types/project.types";
import { toProjectErrorMessage } from "../utils/errors";

const FORM_VISIBILITY_OPTIONS = VISIBILITY_OPTIONS.filter(
  (option): option is { value: "private" | "internal" | "public"; label: string } =>
    option.value !== "all"
);

export interface ProjectSettingsFormProps {
  project: Project;
  onArchive?: () => void;
  onTransfer?: () => void;
  onDelete?: () => void;
}

function ProjectSettingsForm({
  project,
  onArchive,
  onTransfer,
  onDelete,
}: ProjectSettingsFormProps) {
  const update = useUpdateProject(project.id);

  const form = useAppForm({
    schema: projectSettingsSchema,
    defaultValues: {
      name: project.name,
      description: project.description,
      visibility: project.visibility,
      status: project.status,
      timezone: project.timezone,
      color: project.color,
      repositoryUrl: project.repositoryUrl ?? "",
      defaultBranch: project.defaultBranch,
      tags: project.tags,
    } satisfies ProjectSettingsFormValues,
    onSubmit: async (values) => {
      await update.mutateAsync({
        name: values.name,
        description: values.description,
        visibility: values.visibility,
        status: values.status,
        timezone: values.timezone,
        color: values.color,
        repositoryUrl: values.repositoryUrl || undefined,
        defaultBranch: values.defaultBranch,
        tags: values.tags,
      });
    },
  });

  return (
    <div className="flex flex-col gap-8" data-slot="project-settings-form">
      <section className="rounded-xl border border-border p-4 sm:p-6">
        <h2 className="text-base font-semibold text-foreground">General settings</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Update project details visible to your team.
        </p>

        {form.submitError || update.error ? (
          <div className="mt-4">
            <AlertBanner
              tone="error"
              title="Could not save settings"
              description={toProjectErrorMessage(form.submitError || update.error)}
            />
          </div>
        ) : null}

        <PermissionGuard permission="project.update">
          <AppForm form={form} className="mt-4 gap-4">
            <FormController
              name="name"
              control={form.control}
              render={({ field, fieldState }) => (
                <TextInput {...field} label="Project name" required error={fieldState.error?.message} />
              )}
            />
            <FormController
              name="description"
              control={form.control}
              render={({ field, fieldState }) => (
                <TextareaField {...field} label="Description" rows={3} error={fieldState.error?.message} />
              )}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <FormController
                name="status"
                control={form.control}
                render={({ field, fieldState }) => (
                  <SelectField
                    label="Status"
                    options={[
                      { value: "planning", label: "Planning" },
                      { value: "active", label: "Active" },
                      { value: "paused", label: "Paused" },
                      { value: "completed", label: "Completed" },
                      { value: "archived", label: "Archived" },
                    ]}
                    value={field.value}
                    onValueChange={field.onChange}
                    error={fieldState.error?.message}
                  />
                )}
              />
              <FormController
                name="visibility"
                control={form.control}
                render={({ field, fieldState }) => (
                  <SelectField
                    label="Visibility"
                    options={[...FORM_VISIBILITY_OPTIONS]}
                    value={field.value}
                    onValueChange={field.onChange}
                    error={fieldState.error?.message}
                  />
                )}
              />
            </div>
            <FormController
              name="timezone"
              control={form.control}
              render={({ field, fieldState }) => (
                <SelectField
                  label="Timezone"
                  options={[...TIMEZONE_OPTIONS]}
                  value={field.value}
                  onValueChange={field.onChange}
                  error={fieldState.error?.message}
                />
              )}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <FormController
                name="repositoryUrl"
                control={form.control}
                render={({ field, fieldState }) => (
                  <TextInput {...field} label="Repository URL" error={fieldState.error?.message} />
                )}
              />
              <FormController
                name="defaultBranch"
                control={form.control}
                render={({ field, fieldState }) => (
                  <TextInput
                    {...field}
                    label="Default branch"
                    required
                    error={fieldState.error?.message}
                  />
                )}
              />
            </div>
            <FormController
              name="color"
              control={form.control}
              render={({ field, fieldState }) => (
                <TextInput {...field} label="Accent color" error={fieldState.error?.message} />
              )}
            />
            <FormController
              name="tags"
              control={form.control}
              render={({ field, fieldState }) => (
                <TagsInputField
                  label="Tags"
                  value={field.value}
                  onValueChange={field.onChange}
                  error={fieldState.error?.message}
                />
              )}
            />
            <SubmitButton loading={form.isSubmitting || update.isPending} loadingText="Saving…">
              Save settings
            </SubmitButton>
          </AppForm>
        </PermissionGuard>
      </section>

      <PermissionGuard permission="project.update">
        <section className="rounded-xl border border-border p-4 sm:p-6">
          <h2 className="text-base font-semibold text-foreground">Danger zone</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Irreversible or high-impact actions for this project.
          </p>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Button type="button" variant="outline" onClick={onArchive}>
              Archive project
            </Button>
            <Button type="button" variant="outline" onClick={onTransfer}>
              Transfer ownership
            </Button>
            <PermissionGuard permission="project.delete">
              <Button type="button" variant="destructive" onClick={onDelete}>
                Delete project
              </Button>
            </PermissionGuard>
          </div>
        </section>
      </PermissionGuard>
    </div>
  );
}

export { ProjectSettingsForm };
