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

import {
  PROJECT_OPTIONS,
  PROVIDER_OPTIONS,
  VISIBILITY_OPTIONS,
} from "../constants/repository.constants";
import {
  useConnectRepository,
  useCreateRepository,
  useUpdateRepository,
} from "../hooks/use-repositories";
import {
  connectRepositorySchema,
  createRepositorySchema,
  updateRepositorySchema,
  type ConnectRepositoryFormValues,
  type CreateRepositoryFormValues,
  type UpdateRepositoryFormValues,
} from "../schemas/repository.schema";
import type { Repository as RepositoryEntity } from "../types/repository.types";
import { toRepositoryErrorMessage } from "../utils/errors";

const visibilityOptions = VISIBILITY_OPTIONS.filter((o) => o.value !== "all");
const providerOptions = PROVIDER_OPTIONS.filter((o) => o.value !== "all");

export interface RepositoryFormProps {
  mode: "create" | "edit" | "connect";
  repository?: RepositoryEntity;
  defaultProjectId?: string;
  compact?: boolean;
}

function CreateRepositoryFormInner({
  defaultProjectId,
  compact,
}: {
  defaultProjectId?: string;
  compact?: boolean;
}) {
  const create = useCreateRepository();

  const form = useAppForm({
    schema: createRepositorySchema,
    defaultValues: {
      name: "",
      description: "",
      visibility: "private",
      defaultBranch: "main",
      provider: "local",
      remoteUrl: "",
      projectId: defaultProjectId ?? null,
      organization: "",
    } satisfies CreateRepositoryFormValues,
    onSubmit: async (values) => {
      await create.mutateAsync({
        name: values.name,
        description: values.description || undefined,
        visibility: values.visibility,
        defaultBranch: values.defaultBranch,
        provider: values.provider,
        remoteUrl: values.remoteUrl || undefined,
        projectId: values.projectId,
        organization: values.organization || undefined,
      });
    },
  });

  return (
    <div className="flex flex-col gap-4">
      {form.submitError || create.error ? (
        <AlertBanner
          tone="error"
          title="Could not create repository"
          description={toRepositoryErrorMessage(form.submitError || create.error)}
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
        {!compact ? (
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
        ) : null}
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
        <div className="grid gap-4 sm:grid-cols-2">
          <FormController
            name="provider"
            control={form.control}
            render={({ field, fieldState }) => (
              <SelectField
                label="Provider"
                options={providerOptions}
                value={field.value}
                onValueChange={field.onChange}
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
                options={[{ value: "none", label: "No project" }, ...PROJECT_OPTIONS]}
                value={field.value ?? "none"}
                onValueChange={(v) => field.onChange(v === "none" ? null : v)}
                error={fieldState.error?.message}
              />
            )}
          />
        </div>
        {!compact ? (
          <>
            <FormController
              name="organization"
              control={form.control}
              render={({ field, fieldState }) => (
                <TextInput
                  {...field}
                  value={field.value ?? ""}
                  label="Organization"
                  error={fieldState.error?.message}
                />
              )}
            />
            <FormController
              name="remoteUrl"
              control={form.control}
              render={({ field, fieldState }) => (
                <TextInput
                  {...field}
                  value={field.value ?? ""}
                  label="Remote URL"
                  placeholder="https://github.com/org/repo.git"
                  error={fieldState.error?.message}
                />
              )}
            />
          </>
        ) : null}
        <SubmitButton loading={form.isSubmitting || create.isPending} loadingText="Creating…">
          Create repository
        </SubmitButton>
      </AppForm>
    </div>
  );
}

function ConnectRepositoryFormInner({
  defaultProjectId,
  compact,
}: {
  defaultProjectId?: string;
  compact?: boolean;
}) {
  const connect = useConnectRepository();

  const form = useAppForm({
    schema: connectRepositorySchema,
    defaultValues: {
      provider: "github",
      remoteUrl: "",
      name: "",
      description: "",
      visibility: "private",
      defaultBranch: "main",
      projectId: defaultProjectId ?? null,
    } satisfies ConnectRepositoryFormValues,
    onSubmit: async (values) => {
      await connect.mutateAsync({
        provider: values.provider,
        remoteUrl: values.remoteUrl,
        name: values.name || undefined,
        description: values.description || undefined,
        visibility: values.visibility,
        defaultBranch: values.defaultBranch,
        projectId: values.projectId,
      });
    },
  });

  return (
    <div className="flex flex-col gap-4">
      {form.submitError || connect.error ? (
        <AlertBanner
          tone="error"
          title="Could not connect repository"
          description={toRepositoryErrorMessage(form.submitError || connect.error)}
        />
      ) : null}
      <AppForm form={form} className="gap-4">
        <FormController
          name="provider"
          control={form.control}
          render={({ field, fieldState }) => (
            <SelectField
              label="Provider"
              options={providerOptions}
              value={field.value}
              onValueChange={field.onChange}
              error={fieldState.error?.message}
            />
          )}
        />
        <FormController
          name="remoteUrl"
          control={form.control}
          render={({ field, fieldState }) => (
            <TextInput
              {...field}
              label="Remote URL"
              placeholder="https://github.com/org/repo.git"
              required
              error={fieldState.error?.message}
            />
          )}
        />
        {!compact ? (
          <>
            <FormController
              name="name"
              control={form.control}
              render={({ field, fieldState }) => (
                <TextInput
                  {...field}
                  value={field.value ?? ""}
                  label="Name (optional)"
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
                  rows={2}
                  error={fieldState.error?.message}
                />
              )}
            />
          </>
        ) : null}
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
        <SubmitButton loading={form.isSubmitting || connect.isPending} loadingText="Connecting…">
          Connect repository
        </SubmitButton>
      </AppForm>
    </div>
  );
}

function EditRepositoryFormInner({
  repository,
  compact,
}: {
  repository: RepositoryEntity;
  compact?: boolean;
}) {
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

  return (
    <div className="flex flex-col gap-4">
      {form.submitError || update.error ? (
        <AlertBanner
          tone="error"
          title="Could not update repository"
          description={toRepositoryErrorMessage(form.submitError || update.error)}
        />
      ) : null}
      <AppForm form={form} className="gap-4">
        <FormController
          name="name"
          control={form.control}
          render={({ field, fieldState }) => (
            <TextInput
              {...field}
              value={field.value ?? ""}
              label="Name"
              required
              error={fieldState.error?.message}
            />
          )}
        />
        {!compact ? (
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
        ) : null}
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
        <SubmitButton loading={form.isSubmitting || update.isPending} loadingText="Saving…">
          Save changes
        </SubmitButton>
      </AppForm>
    </div>
  );
}

function RepositoryForm({ mode, repository, defaultProjectId, compact }: RepositoryFormProps) {
  if (mode === "edit" && repository) {
    return <EditRepositoryFormInner repository={repository} compact={compact} />;
  }
  if (mode === "connect") {
    return <ConnectRepositoryFormInner defaultProjectId={defaultProjectId} compact={compact} />;
  }
  return <CreateRepositoryFormInner defaultProjectId={defaultProjectId} compact={compact} />;
}

export { RepositoryForm };
