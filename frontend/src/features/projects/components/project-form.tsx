"use client";

import * as React from "react";

import {
  AppForm,
  FormController,
  useAppForm,
  useAppFormWatch,
} from "@/components/forms/form-provider";
import { TextInput } from "@/components/forms/input";
import { TextareaField } from "@/components/forms/textarea";
import { SelectField } from "@/components/forms/select";
import { TagsInputField } from "@/components/forms/tags-input";
import { MultiSelectField } from "@/components/forms/multiselect";
import { SubmitButton } from "@/components/forms/form-actions";
import { AlertBanner } from "@/components/feedback/alert";
import { useCurrentOrganization } from "@/features/organization";

import {
  TECHNOLOGY_OPTIONS,
  TIMEZONE_OPTIONS,
  VISIBILITY_OPTIONS,
} from "../constants/project.constants";
import { useCreateProject, useUpdateProject } from "../hooks/use-projects";
import {
  createProjectSchema,
  updateProjectSchema,
  type CreateProjectFormValues,
  type UpdateProjectFormValues,
} from "../schemas/project.schema";
import type { Project } from "../types/project.types";
import { toProjectErrorMessage } from "../utils/errors";
import { deriveProjectKey } from "../utils/project-key";

const FORM_VISIBILITY_OPTIONS = VISIBILITY_OPTIONS.filter(
  (option): option is { value: "private" | "internal" | "public"; label: string } =>
    option.value !== "all"
);

export interface ProjectFormProps {
  mode: "create" | "edit";
  project?: Project;
}

function CreateProjectForm() {
  const create = useCreateProject();
  const { organizationId } = useCurrentOrganization();
  const [keyTouched, setKeyTouched] = React.useState(false);

  const form = useAppForm({
    schema: createProjectSchema,
    defaultValues: {
      name: "",
      key: "",
      description: "",
      organizationId: organizationId ?? "",
      teamId: "",
      visibility: "private",
      repositoryUrl: "",
      defaultBranch: "main",
      technologyStack: [],
      color: "#2563EB",
      icon: "",
      timezone: "UTC",
      startDate: "",
      endDate: "",
      tags: [],
      labels: [],
    } satisfies CreateProjectFormValues,
    onSubmit: async (values) => {
      await create.mutateAsync({
        name: values.name,
        key: values.key,
        description: values.description ?? "",
        organizationId: values.organizationId,
        teamId: values.teamId || undefined,
        visibility: values.visibility,
        repositoryUrl: values.repositoryUrl || undefined,
        defaultBranch: values.defaultBranch,
        technologyStack: values.technologyStack,
        color: values.color,
        icon: values.icon || undefined,
        timezone: values.timezone,
        startDate: values.startDate || undefined,
        endDate: values.endDate || undefined,
        tags: values.tags,
        labels: values.labels,
      });
    },
  });

  const name = useAppFormWatch({ control: form.control, name: "name" });

  React.useEffect(() => {
    if (organizationId) {
      form.setValue("organizationId", organizationId, { shouldValidate: true });
    }
  }, [organizationId, form]);

  React.useEffect(() => {
    if (!keyTouched && name) {
      form.setValue("key", deriveProjectKey(name), { shouldValidate: true });
    }
  }, [name, keyTouched, form]);

  return (
    <div className="flex flex-col gap-4">
      {form.submitError || create.error ? (
        <AlertBanner
          tone="error"
          title="Could not create project"
          description={toProjectErrorMessage(form.submitError || create.error)}
        />
      ) : null}

      <AppForm form={form} className="gap-4">
        <FormController
          name="name"
          control={form.control}
          render={({ field, fieldState }) => (
            <TextInput
              {...field}
              label="Project name"
              required
              autoComplete="off"
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
              placeholder="API"
              helperText="Uppercase letters and numbers, starting with a letter."
              error={fieldState.error?.message}
              onChange={(value) => {
                setKeyTouched(true);
                field.onChange(value.toUpperCase());
              }}
            />
          )}
        />
        <FormController
          name="description"
          control={form.control}
          render={({ field, fieldState }) => (
            <TextareaField
              {...field}
              label="Description"
              rows={3}
              error={fieldState.error?.message}
            />
          )}
        />
        <div className="grid gap-4 sm:grid-cols-2">
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
        </div>
        <FormController
          name="technologyStack"
          control={form.control}
          render={({ field, fieldState }) => (
            <MultiSelectField
              label="Technology stack"
              options={[...TECHNOLOGY_OPTIONS]}
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
              <TextInput
                {...field}
                label="Repository URL"
                placeholder="https://github.com/org/repo"
                error={fieldState.error?.message}
              />
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
        <div className="grid gap-4 sm:grid-cols-2">
          <FormController
            name="startDate"
            control={form.control}
            render={({ field, fieldState }) => (
              <TextInput
                {...field}
                label="Start date"
                placeholder="YYYY-MM-DD"
                error={fieldState.error?.message}
              />
            )}
          />
          <FormController
            name="endDate"
            control={form.control}
            render={({ field, fieldState }) => (
              <TextInput
                {...field}
                label="End date"
                placeholder="YYYY-MM-DD"
                error={fieldState.error?.message}
              />
            )}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormController
            name="color"
            control={form.control}
            render={({ field, fieldState }) => (
              <TextInput
                {...field}
                label="Accent color"
                placeholder="#2563EB"
                error={fieldState.error?.message}
              />
            )}
          />
          <FormController
            name="icon"
            control={form.control}
            render={({ field, fieldState }) => (
              <TextInput
                {...field}
                label="Icon"
                placeholder="Optional icon name"
                error={fieldState.error?.message}
              />
            )}
          />
        </div>
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
        <FormController
          name="labels"
          control={form.control}
          render={({ field, fieldState }) => (
            <TagsInputField
              label="Labels"
              value={field.value}
              onValueChange={field.onChange}
              error={fieldState.error?.message}
            />
          )}
        />
        <SubmitButton loading={form.isSubmitting || create.isPending} loadingText="Creating…">
          Create project
        </SubmitButton>
      </AppForm>
    </div>
  );
}

function EditProjectForm({ project }: { project: Project }) {
  const update = useUpdateProject(project.id);

  const form = useAppForm({
    schema: updateProjectSchema,
    defaultValues: {
      name: project.name,
      key: project.key,
      description: project.description,
      organizationId: project.organizationId,
      teamId: project.teamId ?? "",
      visibility: project.visibility,
      repositoryUrl: project.repositoryUrl ?? "",
      defaultBranch: project.defaultBranch,
      technologyStack: project.technologyStack,
      color: project.color,
      icon: project.icon ?? "",
      timezone: project.timezone,
      startDate: project.startDate ?? "",
      endDate: project.endDate ?? "",
      tags: project.tags,
      labels: project.labels,
      status: project.status,
    } satisfies UpdateProjectFormValues,
    onSubmit: async (values) => {
      await update.mutateAsync({
        name: values.name,
        key: values.key,
        description: values.description ?? "",
        organizationId: values.organizationId,
        teamId: values.teamId || undefined,
        visibility: values.visibility,
        repositoryUrl: values.repositoryUrl || undefined,
        defaultBranch: values.defaultBranch,
        technologyStack: values.technologyStack,
        color: values.color,
        icon: values.icon || undefined,
        timezone: values.timezone,
        startDate: values.startDate || undefined,
        endDate: values.endDate || undefined,
        tags: values.tags,
        labels: values.labels,
        status: values.status,
      });
    },
  });

  return (
    <div className="flex flex-col gap-4">
      {form.submitError || update.error ? (
        <AlertBanner
          tone="error"
          title="Could not save project"
          description={toProjectErrorMessage(form.submitError || update.error)}
        />
      ) : null}

      <AppForm form={form} className="gap-4">
        <FormController
          name="name"
          control={form.control}
          render={({ field, fieldState }) => (
            <TextInput {...field} label="Project name" required error={fieldState.error?.message} />
          )}
        />
        <FormController
          name="key"
          control={form.control}
          render={({ field, fieldState }) => (
            <TextInput {...field} label="Project key" required error={fieldState.error?.message} />
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
                value={field.value ?? project.status}
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
          name="technologyStack"
          control={form.control}
          render={({ field, fieldState }) => (
            <MultiSelectField
              label="Technology stack"
              options={[...TECHNOLOGY_OPTIONS]}
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
              <TextInput {...field} label="Default branch" required error={fieldState.error?.message} />
            )}
          />
        </div>
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
        <FormController
          name="labels"
          control={form.control}
          render={({ field, fieldState }) => (
            <TagsInputField
              label="Labels"
              value={field.value}
              onValueChange={field.onChange}
              error={fieldState.error?.message}
            />
          )}
        />
        <SubmitButton loading={form.isSubmitting || update.isPending} loadingText="Saving…">
          Save changes
        </SubmitButton>
      </AppForm>
    </div>
  );
}

function ProjectForm({ mode, project }: ProjectFormProps) {
  if (mode === "edit") {
    if (!project) return null;
    return <EditProjectForm project={project} />;
  }
  return <CreateProjectForm />;
}

export { ProjectForm };
