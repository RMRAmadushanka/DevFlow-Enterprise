"use client";

import * as React from "react";
import { useTheme } from "next-themes";

import {
  AppForm,
  FormController,
  useAppForm,
} from "@/components/forms/form-provider";
import { SelectField } from "@/components/forms/select";
import { SubmitButton } from "@/components/forms/form-actions";

import {
  DATE_FORMAT_OPTIONS,
  LANGUAGE_OPTIONS,
  TIMEZONE_OPTIONS,
} from "../constants/auth.constants";
import { useUpdatePreferences } from "../hooks/use-account";
import {
  preferencesSchema,
  type PreferencesFormValues,
} from "../schemas/auth.schema";
import type { AuthUserProfile } from "../types/auth.types";
import { ThemeSelector } from "./theme-selector";

export interface PreferenceFormProps {
  user: AuthUserProfile;
}

function PreferenceForm({ user }: PreferenceFormProps) {
  const { theme } = useTheme();
  const mutation = useUpdatePreferences();

  const form = useAppForm({
    schema: preferencesSchema,
    defaultValues: {
      theme: (theme as PreferencesFormValues["theme"]) || "system",
      language: user.language,
      timezone: user.timezone,
      dateFormat: user.dateFormat,
    } satisfies PreferencesFormValues,
    onSubmit: async (values) => {
      await mutation.mutateAsync(values);
    },
  });

  return (
    <AppForm form={form} className="gap-5">
      <FormController
        name="theme"
        control={form.control}
        render={({ field }) => (
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium text-foreground">Theme</span>
            <ThemeSelector value={field.value} onChange={field.onChange} />
          </div>
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

      <SubmitButton loading={form.isSubmitting || mutation.isPending} loadingText="Saving…">
        Save preferences
      </SubmitButton>
    </AppForm>
  );
}

export { PreferenceForm };
