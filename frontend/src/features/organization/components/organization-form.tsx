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
import { SubmitButton } from "@/components/forms/form-actions";
import { AlertBanner } from "@/components/feedback/alert";
import { PermissionGuard, usePermissions } from "@/lib/permissions";

import {
  INDUSTRY_OPTIONS,
  TIMEZONE_OPTIONS,
} from "../constants/organization.constants";
import { useCreateOrganization, useUpdateOrganization } from "../hooks/use-organizations";
import {
  createOrganizationSchema,
  updateOrganizationSchema,
  type CreateOrganizationFormValues,
  type UpdateOrganizationFormValues,
} from "../schemas/organization.schema";
import type { Organization } from "../types/organization.types";
import { toOrganizationErrorMessage } from "../utils/errors";
import { slugifyOrganizationName } from "../utils/slug";
import {
  DATE_FORMAT_OPTIONS,
  LANGUAGE_OPTIONS,
} from "../constants/organization.constants";

export interface OrganizationFormProps {
  mode: "create" | "edit";
  organization?: Organization;
}

function CreateOrganizationForm() {
  const create = useCreateOrganization();
  const [slugTouched, setSlugTouched] = React.useState(false);

  const form = useAppForm({
    schema: createOrganizationSchema,
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      industry: "technology",
      timezone: "UTC",
      logoUrl: "",
    } satisfies CreateOrganizationFormValues,
    onSubmit: async (values) => {
      await create.mutateAsync({
        name: values.name,
        slug: values.slug,
        description: values.description ?? "",
        industry: values.industry,
        timezone: values.timezone,
        logoUrl: values.logoUrl || undefined,
      });
    },
  });

  const name = useAppFormWatch({ control: form.control, name: "name" });

  React.useEffect(() => {
    if (!slugTouched && name) {
      form.setValue("slug", slugifyOrganizationName(name), { shouldValidate: true });
    }
  }, [name, slugTouched, form]);

  return (
    <div className="flex flex-col gap-4">
      {form.submitError || create.error ? (
        <AlertBanner
          tone="error"
          title="Could not create organization"
          description={toOrganizationErrorMessage(form.submitError || create.error)}
        />
      ) : null}

      <AppForm form={form} className="gap-4">
        <FormController
          name="name"
          control={form.control}
          render={({ field, fieldState }) => (
            <TextInput
              {...field}
              label="Organization name"
              required
              autoComplete="organization"
              error={fieldState.error?.message}
            />
          )}
        />
        <FormController
          name="slug"
          control={form.control}
          render={({ field, fieldState }) => (
            <TextInput
              {...field}
              label="Slug"
              required
              placeholder="acme-corp"
              error={fieldState.error?.message}
              onChange={(value) => {
                setSlugTouched(true);
                field.onChange(value);
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
        <FormController
          name="logoUrl"
          control={form.control}
          render={({ field, fieldState }) => (
            <TextInput
              {...field}
              label="Logo URL"
              placeholder="https://"
              error={fieldState.error?.message}
            />
          )}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <FormController
            name="industry"
            control={form.control}
            render={({ field, fieldState }) => (
              <SelectField
                label="Industry"
                options={[...INDUSTRY_OPTIONS]}
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
        <SubmitButton loading={form.isSubmitting || create.isPending} loadingText="Creating…">
          Create organization
        </SubmitButton>
      </AppForm>
    </div>
  );
}

function EditOrganizationForm({ organization }: { organization: Organization }) {
  const update = useUpdateOrganization(organization.id);
  const { can, role } = usePermissions();
  const canUpdate = role == null ? true : can("organization.update");

  const form = useAppForm({
    schema: updateOrganizationSchema,
    defaultValues: {
      name: organization.name,
      description: organization.description,
      timezone: organization.timezone,
      language: organization.language,
      dateFormat: organization.dateFormat,
      industry: organization.industry,
    } satisfies UpdateOrganizationFormValues,
    onSubmit: async (values) => {
      await update.mutateAsync(values);
    },
  });

  return (
    <div className="flex flex-col gap-4">
      {form.submitError || update.error ? (
        <AlertBanner
          tone="error"
          title="Could not save settings"
          description={toOrganizationErrorMessage(form.submitError || update.error)}
        />
      ) : null}

      <AppForm form={form} className="gap-4">
        <FormController
          name="name"
          control={form.control}
          render={({ field, fieldState }) => (
            <TextInput
              {...field}
              label="Organization name"
              required
              disabled={!canUpdate}
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
              label="Description"
              rows={3}
              disabled={!canUpdate}
              error={fieldState.error?.message}
            />
          )}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <FormController
            name="industry"
            control={form.control}
            render={({ field, fieldState }) => (
              <SelectField
                label="Industry"
                options={[...INDUSTRY_OPTIONS]}
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
          <FormController
            name="language"
            control={form.control}
            render={({ field, fieldState }) => (
              <SelectField
                label="Language"
                options={[...LANGUAGE_OPTIONS]}
                value={field.value}
                onValueChange={field.onChange}
                error={fieldState.error?.message}
              />
            )}
          />
          <FormController
            name="dateFormat"
            control={form.control}
            render={({ field, fieldState }) => (
              <SelectField
                label="Date format"
                options={[...DATE_FORMAT_OPTIONS]}
                value={field.value}
                onValueChange={field.onChange}
                error={fieldState.error?.message}
              />
            )}
          />
        </div>
        <PermissionGuard permission="organization.update">
          <SubmitButton loading={form.isSubmitting || update.isPending} loadingText="Saving…">
            Save changes
          </SubmitButton>
        </PermissionGuard>
      </AppForm>
    </div>
  );
}

function OrganizationForm({ mode, organization }: OrganizationFormProps) {
  if (mode === "edit") {
    if (!organization) return null;
    return <EditOrganizationForm organization={organization} />;
  }
  return <CreateOrganizationForm />;
}

export { OrganizationForm };
