"use client";

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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { VISIBILITY_OPTIONS } from "../constants/repository.constants";
import { useUpdateRepository } from "../hooks/use-repositories";
import {
  updateRepositorySchema,
  type UpdateRepositoryFormValues,
} from "../schemas/repository.schema";
import type { RepositoryDetail } from "../types/repository.types";
import { toRepositoryErrorMessage } from "../utils/errors";

export interface RepositorySettingsProps {
  repository: RepositoryDetail;
}

function RepositorySettings({ repository }: RepositorySettingsProps) {
  const update = useUpdateRepository(repository.id);

  const form = useAppForm({
    schema: updateRepositorySchema,
    defaultValues: {
      name: repository.name,
      description: repository.description,
      visibility: repository.visibility,
      defaultBranch: repository.defaultBranch,
    } satisfies UpdateRepositoryFormValues,
    onSubmit: async (values) => {
      await update.mutateAsync({
        name: values.name,
        description: values.description || undefined,
        visibility: values.visibility,
        defaultBranch: values.defaultBranch,
      });
    },
  });

  const visibilityOptions = VISIBILITY_OPTIONS.filter((o) => o.value !== "all");

  return (
    <div className="flex flex-col gap-6" data-slot="repository-settings">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">General</CardTitle>
        </CardHeader>
        <CardContent>
          {form.submitError || update.error ? (
            <AlertBanner
              tone="error"
              title="Could not update repository"
              description={toRepositoryErrorMessage(form.submitError || update.error)}
              className="mb-4"
            />
          ) : null}
          <AppForm form={form} className="gap-4">
            <FormController
              name="name"
              control={form.control}
              render={({ field, fieldState }) => (
                <TextInput
                  {...field}
                  label="Name"
                  required
                  error={fieldState.error?.message}
                />
              )}
            />
            <FormController
              name="description"
              control={form.control}
              render={({ field, fieldState }) => (
                <TextareaField
                  {...field}
                  value={field.value ?? ""}
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
                    options={visibilityOptions}
                    value={field.value}
                    onValueChange={field.onChange}
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
                    value={field.value ?? ""}
                    label="Default branch"
                    error={fieldState.error?.message}
                  />
                )}
              />
            </div>
            <SubmitButton
              loading={form.isSubmitting || update.isPending}
              loadingText="Saving…"
            >
              Save changes
            </SubmitButton>
          </AppForm>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Remote</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2 text-sm">
          <div>
            <p className="text-muted-foreground">Clone URL</p>
            <p className="break-all font-mono text-foreground">
              {repository.cloneUrl || repository.remoteUrl || "—"}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Remote URL</p>
            <p className="break-all font-mono text-foreground">
              {repository.remoteUrl || "—"}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export { RepositorySettings };
