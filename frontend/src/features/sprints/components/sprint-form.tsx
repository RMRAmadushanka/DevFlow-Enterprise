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
import { SubmitButton } from "@/components/forms/form-actions";
import { AlertBanner } from "@/components/feedback/alert";
import { useProjects } from "@/features/projects";
import { isLiveBackendMode } from "@/lib/api/live-api";

import { PROJECT_OPTIONS } from "../constants/sprint.constants";
import { useCreateSprint, useUpdateSprint } from "../hooks/use-sprints";
import { isSprintApiEnabled } from "../services/sprint-api.service";
import {
  createSprintSchema,
  updateSprintSchema,
  type CreateSprintFormValues,
  type UpdateSprintFormValues,
} from "../schemas/sprint.schema";
import type { Sprint } from "../types/sprint.types";
import { toSprintErrorMessage } from "../utils/errors";

export interface SprintFormProps {
  mode: "create" | "edit";
  sprint?: Sprint;
  defaultProjectId?: string;
  compact?: boolean;
  formId?: string;
  hideSubmit?: boolean;
}

function CreateSprintFormInner({
  defaultProjectId,
  compact,
  formId,
  hideSubmit,
}: {
  defaultProjectId?: string;
  compact?: boolean;
  formId?: string;
  hideSubmit?: boolean;
}) {
  const create = useCreateSprint();
  const liveSprints = isSprintApiEnabled();
  const liveMode = isLiveBackendMode();
  const { data: projectsData } = useProjects({ enabled: liveSprints || liveMode });

  const projectOptions = React.useMemo(() => {
    if (liveSprints || liveMode) {
      return (projectsData?.items ?? []).map((project) => ({
        value: project.id,
        label: `${project.key} — ${project.name}`,
      }));
    }
    return [...PROJECT_OPTIONS];
  }, [liveMode, liveSprints, projectsData?.items]);

  const form = useAppForm({
    schema: createSprintSchema,
    defaultValues: {
      name: "",
      goal: "",
      description: "",
      projectId: defaultProjectId ?? "",
      startDate: "",
      endDate: "",
      capacityPoints: 40,
      storyPointGoal: 30,
    } satisfies CreateSprintFormValues,
    onSubmit: async (values) => {
      await create.mutateAsync({
        name: values.name,
        goal: values.goal || "",
        description: values.description || undefined,
        projectId: values.projectId,
        startDate: values.startDate,
        endDate: values.endDate,
        capacityPoints: values.capacityPoints,
        storyPointGoal: values.storyPointGoal,
      });
    },
  });

  React.useEffect(() => {
    if (!form.getValues("projectId") && (defaultProjectId || projectOptions[0]?.value)) {
      form.setValue("projectId", defaultProjectId || projectOptions[0]!.value);
    }
  }, [defaultProjectId, form, projectOptions]);

  return (
    <div className="flex flex-col gap-4">
      {form.submitError || create.error ? (
        <AlertBanner
          tone="error"
          title="Could not create sprint"
          description={toSprintErrorMessage(form.submitError || create.error)}
        />
      ) : null}
      {(liveSprints || liveMode) && projectOptions.length === 0 ? (
        <AlertBanner
          tone="warning"
          title="No projects available"
          description="Create a project first, then add sprints to it."
        />
      ) : null}
      <AppForm form={form} id={formId} className="gap-4">
        <FormController
          name="name"
          control={form.control}
          render={({ field, fieldState }) => (
            <TextInput {...field} label="Name" required error={fieldState.error?.message} />
          )}
        />
        <FormController
          name="goal"
          control={form.control}
          render={({ field, fieldState }) => (
            <TextInput {...field} label="Goal" error={fieldState.error?.message} />
          )}
        />
        {!compact ? (
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
        ) : null}
        <FormController
          name="projectId"
          control={form.control}
          render={({ field, fieldState }) => (
            <SelectField
              label="Project"
              options={projectOptions}
              value={field.value}
              onValueChange={field.onChange}
              error={fieldState.error?.message}
            />
          )}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <FormController
            name="startDate"
            control={form.control}
            render={({ field, fieldState }) => (
              <TextInput
                {...field}
                label="Start date"
                placeholder="YYYY-MM-DD"
                required
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
                required
                error={fieldState.error?.message}
              />
            )}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormController
            name="capacityPoints"
            control={form.control}
            render={({ field, fieldState }) => (
              <TextInput
                {...field}
                value={field.value != null ? String(field.value) : ""}
                label="Capacity (points)"
                required
                error={fieldState.error?.message}
              />
            )}
          />
          <FormController
            name="storyPointGoal"
            control={form.control}
            render={({ field, fieldState }) => (
              <TextInput
                {...field}
                value={field.value != null ? String(field.value) : ""}
                label="Story point goal"
                required
                error={fieldState.error?.message}
              />
            )}
          />
        </div>
        {hideSubmit ? null : (
          <SubmitButton loading={form.isSubmitting || create.isPending} loadingText="Creating…">
            Create sprint
          </SubmitButton>
        )}
      </AppForm>
    </div>
  );
}

function EditSprintFormInner({ sprint, compact }: { sprint: Sprint; compact?: boolean }) {
  const update = useUpdateSprint(sprint.id);
  const liveSprints = isSprintApiEnabled();
  const liveMode = isLiveBackendMode();
  const { data: projectsData } = useProjects({ enabled: liveSprints || liveMode });

  const projectOptions = React.useMemo(() => {
    if (liveSprints || liveMode) {
      return (projectsData?.items ?? []).map((project) => ({
        value: project.id,
        label: `${project.key} — ${project.name}`,
      }));
    }
    return [...PROJECT_OPTIONS];
  }, [liveMode, liveSprints, projectsData?.items]);

  const form = useAppForm({
    schema: updateSprintSchema,
    defaultValues: {
      name: sprint.name,
      goal: sprint.goal,
      description: sprint.description,
      projectId: sprint.projectId,
      startDate: sprint.startDate,
      endDate: sprint.endDate,
      capacityPoints: sprint.capacityPoints,
      storyPointGoal: sprint.storyPointGoal,
    } satisfies UpdateSprintFormValues,
    onSubmit: async (values) => {
      await update.mutateAsync({
        name: values.name,
        goal: values.goal || "",
        description: values.description || undefined,
        projectId: values.projectId,
        startDate: values.startDate,
        endDate: values.endDate,
        capacityPoints: values.capacityPoints,
        storyPointGoal: values.storyPointGoal,
      });
    },
  });

  return (
    <div className="flex flex-col gap-4">
      {form.submitError || update.error ? (
        <AlertBanner
          tone="error"
          title="Could not update sprint"
          description={toSprintErrorMessage(form.submitError || update.error)}
        />
      ) : null}
      <AppForm form={form} className="gap-4">
        <FormController
          name="name"
          control={form.control}
          render={({ field, fieldState }) => (
            <TextInput {...field} label="Name" required error={fieldState.error?.message} />
          )}
        />
        <FormController
          name="goal"
          control={form.control}
          render={({ field, fieldState }) => (
            <TextInput {...field} label="Goal" error={fieldState.error?.message} />
          )}
        />
        {!compact ? (
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
        ) : null}
        <FormController
          name="projectId"
          control={form.control}
          render={({ field, fieldState }) => (
            <SelectField
              label="Project"
              options={projectOptions}
              value={field.value}
              onValueChange={field.onChange}
              error={fieldState.error?.message}
            />
          )}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <FormController
            name="startDate"
            control={form.control}
            render={({ field, fieldState }) => (
              <TextInput
                {...field}
                label="Start date"
                placeholder="YYYY-MM-DD"
                required
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
                required
                error={fieldState.error?.message}
              />
            )}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormController
            name="capacityPoints"
            control={form.control}
            render={({ field, fieldState }) => (
              <TextInput
                {...field}
                value={field.value != null ? String(field.value) : ""}
                label="Capacity (points)"
                required
                error={fieldState.error?.message}
              />
            )}
          />
          <FormController
            name="storyPointGoal"
            control={form.control}
            render={({ field, fieldState }) => (
              <TextInput
                {...field}
                value={field.value != null ? String(field.value) : ""}
                label="Story point goal"
                required
                error={fieldState.error?.message}
              />
            )}
          />
        </div>
        <SubmitButton loading={form.isSubmitting || update.isPending} loadingText="Saving…">
          Save changes
        </SubmitButton>
      </AppForm>
    </div>
  );
}

function SprintForm({ mode, sprint, defaultProjectId, compact, formId, hideSubmit }: SprintFormProps) {
  if (mode === "edit" && sprint) {
    return <EditSprintFormInner sprint={sprint} compact={compact} />;
  }
  return (
    <CreateSprintFormInner
      defaultProjectId={defaultProjectId}
      compact={compact}
      formId={formId}
      hideSubmit={hideSubmit}
    />
  );
}

export { SprintForm };
