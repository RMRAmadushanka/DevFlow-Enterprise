"use client";

import * as React from "react";

import {
  AppForm,
  FormController,
  useAppForm,
  useAppFormWatch,
} from "@/components/forms/form-provider";
import { TextInput } from "@/components/forms/input";
import { SubmitButton } from "@/components/forms/form-actions";
import { AlertBanner } from "@/components/feedback/alert";
import { PermissionGuard, usePermissions } from "@/lib/permissions";

import { useUpdateBranding } from "../hooks/use-organizations";
import { brandingSchema, type BrandingFormValues } from "../schemas/organization.schema";
import type { Organization } from "../types/organization.types";
import { toOrganizationErrorMessage } from "../utils/errors";

export interface BrandingFormProps {
  organization: Organization;
}

function BrandingForm({ organization }: BrandingFormProps) {
  const update = useUpdateBranding(organization.id);
  const { can, role } = usePermissions();
  const canUpdate = role == null ? true : can("organization.update");

  const form = useAppForm({
    schema: brandingSchema,
    defaultValues: {
      logoUrl: organization.branding.logoUrl ?? organization.logoUrl ?? "",
      primaryColor: organization.branding.primaryColor,
      accentColor: organization.branding.accentColor,
    } satisfies BrandingFormValues,
    onSubmit: async (values) => {
      await update.mutateAsync({
        logoUrl: values.logoUrl || undefined,
        primaryColor: values.primaryColor,
        accentColor: values.accentColor,
      });
    },
  });

  const primaryColor = useAppFormWatch({ control: form.control, name: "primaryColor" });
  const accentColor = useAppFormWatch({ control: form.control, name: "accentColor" });
  const logoUrl = useAppFormWatch({ control: form.control, name: "logoUrl" });

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_16rem]">
      <div className="flex flex-col gap-4">
        {form.submitError || update.error ? (
          <AlertBanner
            tone="error"
            title="Could not save branding"
            description={toOrganizationErrorMessage(form.submitError || update.error)}
          />
        ) : null}
        <AppForm form={form} className="gap-4">
          <FormController
            name="logoUrl"
            control={form.control}
            render={({ field, fieldState }) => (
              <TextInput
                {...field}
                label="Logo URL"
                placeholder="https://"
                disabled={!canUpdate}
                error={fieldState.error?.message}
              />
            )}
          />
          <FormController
            name="primaryColor"
            control={form.control}
            render={({ field, fieldState }) => (
              <TextInput
                {...field}
                label="Primary color"
                placeholder="#2563EB"
                disabled={!canUpdate}
                error={fieldState.error?.message}
              />
            )}
          />
          <FormController
            name="accentColor"
            control={form.control}
            render={({ field, fieldState }) => (
              <TextInput
                {...field}
                label="Accent color"
                placeholder="#0F172A"
                disabled={!canUpdate}
                error={fieldState.error?.message}
              />
            )}
          />
          <PermissionGuard permission="organization.update">
            <SubmitButton loading={form.isSubmitting || update.isPending} loadingText="Saving…">
              Save branding
            </SubmitButton>
          </PermissionGuard>
        </AppForm>
      </div>

      <aside
        className="rounded-xl border border-border bg-[linear-gradient(145deg,var(--org-brand-primary),var(--org-brand-accent))] p-4"
        aria-label="Branding preview"
        // Dynamic brand tokens from user-controlled hex values
        style={
          {
            "--org-brand-primary": primaryColor || "#2563EB",
            "--org-brand-accent": accentColor || "#0F172A",
          } as React.CSSProperties
        }
      >
        <div className="rounded-lg bg-background/95 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center overflow-hidden rounded-md border border-border bg-muted">
              {logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={logoUrl} alt="" className="size-full object-cover" />
              ) : (
                <span className="text-xs font-semibold text-muted-foreground">Logo</span>
              )}
            </div>
            <div>
              <p className="text-sm font-semibold">{organization.name}</p>
              <p className="text-xs text-muted-foreground">Brand preview</p>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}

export { BrandingForm };
