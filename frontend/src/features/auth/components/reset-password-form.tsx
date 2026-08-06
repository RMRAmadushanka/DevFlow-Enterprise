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

import { usePasswordReset } from "../hooks/use-password-reset";
import {
  resetPasswordSchema,
  type ResetPasswordFormValues,
} from "../schemas/auth.schema";
import { PasswordStrength } from "./password-strength";

export interface ResetPasswordFormProps {
  token: string;
}

function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const { resetPassword, resetPending, resetErrorMessage } = usePasswordReset();

  const form = useAppForm({
    schema: resetPasswordSchema,
    defaultValues: {
      password: "",
      confirmPassword: "",
    } satisfies ResetPasswordFormValues,
    onSubmit: async (values) => {
      await resetPassword({ token, password: values.password });
    },
  });

  const password = useAppFormWatch({ control: form.control, name: "password" });

  return (
    <div className="flex flex-col gap-4">
      {resetErrorMessage || form.submitError ? (
        <AlertBanner
          tone="error"
          title="Unable to reset password"
          description={resetErrorMessage ?? form.submitError ?? undefined}
        />
      ) : null}

      <AppForm form={form} className="gap-4">
        <FormController
          name="password"
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
              <PasswordStrength value={password ?? ""} />
            </div>
          )}
        />
        <FormController
          name="confirmPassword"
          control={form.control}
          render={({ field, fieldState }) => (
            <PasswordInput
              {...field}
              label="Confirm password"
              autoComplete="new-password"
              required
              error={fieldState.error?.message}
            />
          )}
        />
        <SubmitButton loading={form.isSubmitting || resetPending} loadingText="Updating…">
          Update password
        </SubmitButton>
      </AppForm>
    </div>
  );
}

export { ResetPasswordForm };
