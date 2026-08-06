"use client";

import * as React from "react";

import {
  AppForm,
  FormController,
  useAppForm,
} from "@/components/forms/form-provider";
import { TextInput } from "@/components/forms/input";
import { SubmitButton } from "@/components/forms/form-actions";
import { AlertBanner } from "@/components/feedback/alert";

import { usePasswordReset } from "../hooks/use-password-reset";
import {
  forgotPasswordSchema,
  type ForgotPasswordFormValues,
} from "../schemas/auth.schema";

function ForgotPasswordForm() {
  const { forgotPassword, forgotPending, forgotSuccess, forgotErrorMessage, resetForgot } =
    usePasswordReset();

  const form = useAppForm({
    schema: forgotPasswordSchema,
    defaultValues: { email: "" } satisfies ForgotPasswordFormValues,
    onSubmit: async (values) => {
      resetForgot();
      await forgotPassword(values);
    },
  });

  if (forgotSuccess) {
    return (
      <AlertBanner
        tone="success"
        title="Password reset link has been sent"
        description="Check your inbox for instructions to choose a new password."
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {forgotErrorMessage || form.submitError ? (
        <AlertBanner
          tone="error"
          title="Unable to send reset link"
          description={forgotErrorMessage ?? form.submitError ?? undefined}
        />
      ) : null}

      <AppForm form={form} className="gap-4">
        <FormController
          name="email"
          control={form.control}
          render={({ field, fieldState }) => (
            <TextInput
              {...field}
              type="email"
              label="Email"
              autoComplete="email"
              required
              error={fieldState.error?.message}
            />
          )}
        />
        <SubmitButton loading={form.isSubmitting || forgotPending} loadingText="Sending…">
          Send reset link
        </SubmitButton>
      </AppForm>
    </div>
  );
}

export { ForgotPasswordForm };
