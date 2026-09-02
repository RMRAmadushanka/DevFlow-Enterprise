"use client";

import { FormModal } from "@/components/feedback/modal";
import {
  AppForm,
  FormController,
  useAppForm,
} from "@/components/forms/form-provider";
import { TextInput } from "@/components/forms/input";
import { TextareaField } from "@/components/forms/textarea";
import { SelectField } from "@/components/forms/select";
import { Button } from "@/components/ui/button";
import { AlertBanner } from "@/components/feedback/alert";
import { useProjects } from "@/features/projects";
import { isLiveBackendMode } from "@/lib/api/live-api";

import { PROJECT_OPTIONS } from "../constants/sprint.constants";
import { useCreateRelease, useUpdateRelease } from "../hooks/use-sprints";
import { releaseSchema, type ReleaseFormValues } from "../schemas/sprint.schema";
import { isSprintApiEnabled } from "../services/sprint-api.service";
import type { Release } from "../types/sprint.types";
import { toSprintErrorMessage } from "../utils/errors";

const RELEASE_FORM_ID = "release-form";

const RELEASE_STATUS_OPTIONS = [
  { value: "planned", label: "Planned" },
  { value: "in_progress", label: "In progress" },
  { value: "released", label: "Released" },
  { value: "delayed", label: "Delayed" },
];

export interface ReleaseFormModalProps {
  mode: "create" | "edit";
  release?: Release | null;
  defaultProjectId?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function ReleaseFormModal({
  mode,
  release,
  defaultProjectId,
  open,
  onOpenChange,
}: ReleaseFormModalProps) {
  const isEdit = mode === "edit" && Boolean(release);
  const create = useCreateRelease();
  const update = useUpdateRelease(release?.id ?? "unknown");
  const liveReleases = isSprintApiEnabled();
  const liveMode = isLiveBackendMode();
  const { data: projectsData } = useProjects({ enabled: liveReleases || liveMode });

  const projectOptions =
    liveReleases || liveMode
      ? (projectsData?.items ?? []).map((project) => ({
          value: project.id,
          label: `${project.key} — ${project.name}`,
        }))
      : [...PROJECT_OPTIONS];

  const pending = create.isPending || update.isPending;
  const error = create.error || update.error;

  const form = useAppForm({
    schema: releaseSchema,
    defaultValues: {
      name: release?.name ?? "",
      version: release?.version ?? "",
      description: release?.description ?? "",
      projectId: release?.projectId ?? defaultProjectId ?? "",
      status: release?.status ?? "planned",
      releaseDate: release?.releaseDate ?? "",
    } satisfies ReleaseFormValues,
    onSubmit: async (values) => {
      if (isEdit && release) {
        await update.mutateAsync({
          name: values.name,
          version: values.version || undefined,
          description: values.description || undefined,
          status: values.status,
          releaseDate: values.releaseDate || undefined,
        });
      } else {
        await create.mutateAsync({
          projectId: values.projectId,
          name: values.name,
          version: values.version || undefined,
          description: values.description || undefined,
          status: values.status,
          releaseDate: values.releaseDate || undefined,
        });
      }
      onOpenChange(false);
    },
  });

  return (
    <FormModal
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? "Edit release" : "New release"}
      description={
        isEdit ? `Update details for ${release?.name}.` : "Plan a new release for your team."
      }
      size="lg"
      footer={
        <>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" form={RELEASE_FORM_ID} disabled={pending}>
            {isEdit ? "Save changes" : "Create release"}
          </Button>
        </>
      }
    >
      <AppForm form={form} id={RELEASE_FORM_ID} className="gap-4">
        {form.submitError || error ? (
          <AlertBanner
            tone="error"
            title="Could not save release"
            description={toSprintErrorMessage(form.submitError || error)}
          />
        ) : null}
        <FormController
          name="name"
          control={form.control}
          render={({ field, fieldState }) => (
            <TextInput {...field} label="Name" required error={fieldState.error?.message} />
          )}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <FormController
            name="version"
            control={form.control}
            render={({ field, fieldState }) => (
              <TextInput
                {...field}
                label="Version"
                placeholder="v1.0.0"
                error={fieldState.error?.message}
              />
            )}
          />
          <FormController
            name="releaseDate"
            control={form.control}
            render={({ field, fieldState }) => (
              <TextInput
                {...field}
                label="Release date"
                placeholder="YYYY-MM-DD"
                error={fieldState.error?.message}
              />
            )}
          />
        </div>
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
              disabled={isEdit}
            />
          )}
        />
        <FormController
          name="status"
          control={form.control}
          render={({ field, fieldState }) => (
            <SelectField
              label="Status"
              options={RELEASE_STATUS_OPTIONS}
              value={field.value}
              onValueChange={(value) => field.onChange(value ?? "planned")}
              error={fieldState.error?.message}
            />
          )}
        />
      </AppForm>
    </FormModal>
  );
}

export { ReleaseFormModal };
