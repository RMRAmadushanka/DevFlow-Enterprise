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
  keycloakForgotPasswordGateSchema,
  type ForgotPasswordFormValues,
} from "../schemas/auth.schema";

function ForgotPasswordForm() {
  const {
    forgotPassword,
    forgotPending,
    forgotSuccess,
    forgotErrorMessage,
    resetForgot,
    oidcEnabled,
  } = usePasswordReset();

  const form = useAppForm({
    schema: oidcEnabled ? keycloakForgotPasswordGateSchema : forgotPasswordSchema,
    defaultValues: { email: "" } satisfies ForgotPasswordFormValues,
    onSubmit: async (values) => {
      resetForgot();
      await forgotPassword({ email: values.email ?? "" });
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
      {oidcEnabled ? (
        <AlertBanner
          tone="info"
          title="Password reset"
          description="You will continue in Keycloak to reset your password securely."
        />
      ) : null}
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
              required={!oidcEnabled}
              error={fieldState.error?.message}
            />
          )}
        />
        <SubmitButton
          loading={form.isSubmitting || forgotPending}
          loadingText={oidcEnabled ? "Redirecting…" : "Sending…"}
        >
          {oidcEnabled ? "Continue to Keycloak" : "Send reset link"}
        </SubmitButton>
      </AppForm>
    </div>
  );
}

export { ForgotPasswordForm };
