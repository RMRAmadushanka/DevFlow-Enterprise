"use client";

import * as React from "react";

import {
  AppForm,
  FormController,
  useAppForm,
  useAppFormWatch,
} from "@/components/forms/form-provider";
import { PasswordInput } from "@/components/forms/password";
import { SubmitButton } from "@/components/forms/form-actions";
import { AlertBanner } from "@/components/feedback/alert";

import { useChangePassword } from "../hooks/use-account";
import {
  changePasswordSchema,
  type ChangePasswordFormValues,
} from "../schemas/auth.schema";
import { toAuthErrorMessage } from "../utils/errors";
import { PasswordStrength } from "./password-strength";

function ChangePasswordForm() {
  const mutation = useChangePassword();

  const form = useAppForm({
    schema: changePasswordSchema,
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    } satisfies ChangePasswordFormValues,
    onSubmit: async (values) => {
      await mutation.mutateAsync({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      form.reset();
    },
  });

  const newPassword = useAppFormWatch({ control: form.control, name: "newPassword" });

  return (
    <div className="flex flex-col gap-4">
      {form.submitError || mutation.error ? (
        <AlertBanner
          tone="error"
          title="Password change failed"
          description={toAuthErrorMessage(form.submitError || mutation.error)}
        />
      ) : null}

      <AppForm form={form} className="gap-4">
        <FormController
          name="currentPassword"
          control={form.control}
          render={({ field, fieldState }) => (
            <PasswordInput
              {...field}
              label="Current password"
              autoComplete="current-password"
              required
              error={fieldState.error?.message}
            />
          )}
        />
        <FormController
          name="newPassword"
          control={form.control}
          render={({ field, fieldState }) => (
            <div className="flex flex-col gap-2">
              <PasswordInput
                {...field}
                label="New password"
                autoComplete="new-password"
                required
                error={fieldState.error?.message}
              />
              <PasswordStrength value={newPassword ?? ""} />
            </div>
          )}
        />
        <FormController
          name="confirmPassword"
          control={form.control}
          render={({ field, fieldState }) => (
            <PasswordInput
              {...field}
              label="Confirm new password"
              autoComplete="new-password"
              required
              error={fieldState.error?.message}
            />
          )}
        />
        <SubmitButton loading={form.isSubmitting || mutation.isPending} loadingText="Updating…">
          Update password
        </SubmitButton>
      </AppForm>
    </div>
  );
}

export { ChangePasswordForm };
