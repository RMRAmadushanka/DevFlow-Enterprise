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

import {
  LABEL_CATALOG,
  PRIORITY_OPTIONS,
  PROJECT_OPTIONS,
  SPRINT_OPTIONS,
  STATUS_OPTIONS,
  USER_OPTIONS,
} from "../constants/task.constants";
import { useCreateTask, useUpdateTask } from "../hooks/use-tasks";
import {
  createTaskSchema,
  updateTaskSchema,
  type CreateTaskFormValues,
  type UpdateTaskFormValues,
} from "../schemas/task.schema";
import type { Task, TaskPriority, TaskStatus } from "../types/task.types";
import { toTaskErrorMessage } from "../utils/errors";

const FORM_STATUS_OPTIONS = STATUS_OPTIONS.filter(
  (option): option is { value: TaskStatus; label: string } => option.value !== "all"
);

const FORM_PRIORITY_OPTIONS = PRIORITY_OPTIONS.filter(
  (option): option is { value: TaskPriority; label: string } => option.value !== "all"
);

const LABEL_SUGGESTIONS = LABEL_CATALOG.map((label) => label.name);

export interface TaskFormProps {
  mode: "create" | "edit";
  task?: Task;
  compact?: boolean;
}

function CreateTaskFormInner({ compact }: { compact?: boolean }) {
  const create = useCreateTask();

  const form = useAppForm({
    schema: createTaskSchema,
    defaultValues: {
      title: "",
      description: "",
      projectId: PROJECT_OPTIONS[0]?.value ?? "",
      sprintId: "",
      status: "todo",
      priority: "medium",
      assigneeId: "",
      reporterId: "",
      labels: [],
      storyPoints: undefined,
      estimateMinutes: undefined,
      dueDate: "",
      startDate: "",
      parentId: "",
      dependencyIds: [],
      checklist: [],
    } satisfies CreateTaskFormValues,
    onSubmit: async (values) => {
      await create.mutateAsync({
        title: values.title,
        description: values.description || undefined,
        projectId: values.projectId,
        sprintId: values.sprintId || undefined,
        status: values.status,
        priority: values.priority,
        assigneeId: values.assigneeId || undefined,
        reporterId: values.reporterId || undefined,
        labels: values.labels,
        storyPoints: Number.isFinite(values.storyPoints) ? values.storyPoints : undefined,
        estimateMinutes: Number.isFinite(values.estimateMinutes)
          ? values.estimateMinutes
          : undefined,
        dueDate: values.dueDate || undefined,
        startDate: values.startDate || undefined,
        parentId: values.parentId || undefined,
        dependencyIds: values.dependencyIds,
        checklist: values.checklist,
      });
    },
  });

  return (
    <div className="flex flex-col gap-4">
      {form.submitError || create.error ? (
        <AlertBanner
          tone="error"
          title="Could not create task"
          description={toTaskErrorMessage(form.submitError || create.error)}
        />
      ) : null}

      <AppForm form={form} className="gap-4">
        <FormController
          name="title"
          control={form.control}
          render={({ field, fieldState }) => (
            <TextInput {...field} label="Title" required error={fieldState.error?.message} />
          )}
        />
        {!compact ? (
          <FormController
            name="description"
            control={form.control}
            render={({ field, fieldState }) => (
              <TextareaField {...field} label="Description" rows={4} error={fieldState.error?.message} />
            )}
          />
        ) : null}
        <div className="grid gap-4 sm:grid-cols-2">
          <FormController
            name="projectId"
            control={form.control}
            render={({ field, fieldState }) => (
              <SelectField
                label="Project"
                options={[...PROJECT_OPTIONS]}
                value={field.value}
                onValueChange={field.onChange}
                error={fieldState.error?.message}
              />
            )}
          />
          <FormController
            name="sprintId"
            control={form.control}
            render={({ field, fieldState }) => (
              <SelectField
                label="Sprint"
                options={[{ value: "", label: "No sprint" }, ...SPRINT_OPTIONS]}
                value={field.value ?? ""}
                onValueChange={field.onChange}
                error={fieldState.error?.message}
              />
            )}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormController
            name="status"
            control={form.control}
            render={({ field, fieldState }) => (
              <SelectField
                label="Status"
                options={[...FORM_STATUS_OPTIONS]}
                value={field.value}
                onValueChange={field.onChange}
                error={fieldState.error?.message}
              />
            )}
          />
          <FormController
            name="priority"
            control={form.control}
            render={({ field, fieldState }) => (
              <SelectField
                label="Priority"
                options={[...FORM_PRIORITY_OPTIONS]}
                value={field.value}
                onValueChange={field.onChange}
                error={fieldState.error?.message}
              />
            )}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormController
            name="assigneeId"
            control={form.control}
            render={({ field, fieldState }) => (
              <SelectField
                label="Assignee"
                options={[{ value: "", label: "Unassigned" }, ...USER_OPTIONS]}
                value={field.value ?? ""}
                onValueChange={field.onChange}
                error={fieldState.error?.message}
              />
            )}
          />
          <FormController
            name="reporterId"
            control={form.control}
            render={({ field, fieldState }) => (
              <SelectField
                label="Reporter"
                options={[{ value: "", label: "Default reporter" }, ...USER_OPTIONS]}
                value={field.value ?? ""}
                onValueChange={field.onChange}
                error={fieldState.error?.message}
              />
            )}
          />
        </div>
        {!compact ? (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormController
                name="storyPoints"
                control={form.control}
                render={({ field, fieldState }) => (
                  <TextInput
                    {...field}
                    value={field.value != null ? String(field.value) : ""}
                    label="Story points"
                    error={fieldState.error?.message}
                  />
                )}
              />
              <FormController
                name="estimateMinutes"
                control={form.control}
                render={({ field, fieldState }) => (
                  <TextInput
                    {...field}
                    value={field.value != null ? String(field.value) : ""}
                    label="Estimate (minutes)"
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
                name="dueDate"
                control={form.control}
                render={({ field, fieldState }) => (
                  <TextInput
                    {...field}
                    label="Due date"
                    placeholder="YYYY-MM-DD"
                    error={fieldState.error?.message}
                  />
                )}
              />
            </div>
            <FormController
              name="labels"
              control={form.control}
              render={({ field, fieldState }) => (
                <TagsInputField
                  label="Labels"
                  value={field.value}
                  onValueChange={field.onChange}
                  suggestions={LABEL_SUGGESTIONS}
                  error={fieldState.error?.message}
                />
              )}
            />
            <FormController
              name="checklist"
              control={form.control}
              render={({ field, fieldState }) => (
                <TagsInputField
                  label="Checklist items"
                  value={field.value}
                  onValueChange={field.onChange}
                  error={fieldState.error?.message}
                  helperText="Press Enter to add checklist items"
                />
              )}
            />
          </>
        ) : null}
        <SubmitButton loading={form.isSubmitting || create.isPending} loadingText="Creating…">
          Create task
        </SubmitButton>
      </AppForm>
    </div>
  );
}

function EditTaskFormInner({ task }: { task: Task }) {
  const update = useUpdateTask(task.id);

  const form = useAppForm({
    schema: updateTaskSchema,
    defaultValues: {
      title: task.title,
      description: task.description,
      projectId: task.projectId,
      sprintId: task.sprintId ?? "",
      status: task.status,
      priority: task.priority,
      assigneeId: task.assignee?.id ?? "",
      reporterId: task.reporter.id,
      labels: task.labels.map((label) => label.name),
      storyPoints: task.storyPoints,
      estimateMinutes: task.estimateMinutes,
      dueDate: task.dueDate ?? "",
      startDate: task.startDate ?? "",
      parentId: task.parentId ?? "",
      dependencyIds: [],
      checklist: [],
    } satisfies UpdateTaskFormValues,
    onSubmit: async (values) => {
      await update.mutateAsync({
        title: values.title,
        description: values.description || undefined,
        projectId: values.projectId,
        sprintId: values.sprintId || undefined,
        status: values.status,
        priority: values.priority,
        assigneeId: values.assigneeId || undefined,
        reporterId: values.reporterId || undefined,
        labels: values.labels,
        storyPoints: Number.isFinite(values.storyPoints) ? values.storyPoints : undefined,
        estimateMinutes: Number.isFinite(values.estimateMinutes)
          ? values.estimateMinutes
          : undefined,
        dueDate: values.dueDate || undefined,
        startDate: values.startDate || undefined,
        parentId: values.parentId || undefined,
      });
    },
  });

  return (
    <div className="flex flex-col gap-4">
      {form.submitError || update.error ? (
        <AlertBanner
          tone="error"
          title="Could not save task"
          description={toTaskErrorMessage(form.submitError || update.error)}
        />
      ) : null}

      <AppForm form={form} className="gap-4">
        <FormController
          name="title"
          control={form.control}
          render={({ field, fieldState }) => (
            <TextInput {...field} label="Title" required error={fieldState.error?.message} />
          )}
        />
        <FormController
          name="description"
          control={form.control}
          render={({ field, fieldState }) => (
            <TextareaField {...field} label="Description" rows={4} error={fieldState.error?.message} />
          )}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <FormController
            name="status"
            control={form.control}
            render={({ field, fieldState }) => (
              <SelectField
                label="Status"
                options={[...FORM_STATUS_OPTIONS]}
                value={field.value}
                onValueChange={field.onChange}
                error={fieldState.error?.message}
              />
            )}
          />
          <FormController
            name="priority"
            control={form.control}
            render={({ field, fieldState }) => (
              <SelectField
                label="Priority"
                options={[...FORM_PRIORITY_OPTIONS]}
                value={field.value}
                onValueChange={field.onChange}
                error={fieldState.error?.message}
              />
            )}
          />
        </div>
        <FormController
          name="labels"
          control={form.control}
          render={({ field, fieldState }) => (
            <TagsInputField
              label="Labels"
              value={field.value}
              onValueChange={field.onChange}
              suggestions={LABEL_SUGGESTIONS}
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

function TaskForm({ mode, task, compact }: TaskFormProps) {
  if (mode === "edit") {
    if (!task) return null;
    return <EditTaskFormInner task={task} />;
  }
  return <CreateTaskFormInner compact={compact} />;
}

export { TaskForm };
