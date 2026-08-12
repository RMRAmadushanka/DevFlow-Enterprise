"use client";

import * as React from "react";

import {
  AppForm,
  FormController,
  useAppForm,
  useAppFormWatch,
} from "@/components/forms/form-provider";
import { TextInput } from "@/components/forms/input";
import { PasswordInput } from "@/components/forms/password";
import { CheckboxField } from "@/components/forms/checkbox";
import { SubmitButton } from "@/components/forms/form-actions";
import { AlertBanner } from "@/components/feedback/alert";

import { useRegister } from "../hooks/use-register";
import {
  keycloakRegisterGateSchema,
  registerSchema,
  type RegisterFormValues,
} from "../schemas/auth.schema";
import { PasswordStrength } from "./password-strength";

function RegisterForm() {
  const { register, isPending, errorMessage, reset, oidcEnabled } = useRegister();

  const form = useAppForm({
    schema: oidcEnabled ? keycloakRegisterGateSchema : registerSchema,
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      acceptTerms: false,
    } satisfies RegisterFormValues,
    mode: "onBlur",
    onSubmit: async (values) => {
      reset();
      await register({
        firstName: values.firstName ?? "",
        lastName: values.lastName ?? "",
        email: values.email ?? "",
        password: values.password ?? "",
        acceptTerms: Boolean(values.acceptTerms),
      });
    },
  });

  const password = useAppFormWatch({ control: form.control, name: "password" });

  return (
    <div className="flex flex-col gap-4">
      {oidcEnabled ? (
        <AlertBanner
          tone="info"
          title="Enterprise registration"
          description="You will create your identity in Keycloak. DevFlow never stores your password."
        />
      ) : null}
      {errorMessage || form.submitError ? (
        <AlertBanner
          tone="error"
          title="Registration failed"
          description={errorMessage ?? form.submitError ?? undefined}
        />
      ) : null}

      <AppForm form={form} className="gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormController
            name="firstName"
            control={form.control}
            render={({ field, fieldState }) => (
              <TextInput
                {...field}
                label="First name"
                autoComplete="given-name"
                required={!oidcEnabled}
                error={fieldState.error?.message}
              />
            )}
          />
          <FormController
            name="lastName"
            control={form.control}
            render={({ field, fieldState }) => (
              <TextInput
                {...field}
                label="Last name"
                autoComplete="family-name"
                required={!oidcEnabled}
                error={fieldState.error?.message}
              />
            )}
          />
        </div>

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

        <FormController
          name="password"
          control={form.control}
          render={({ field, fieldState }) => (
            <div className="flex flex-col gap-2">
              <PasswordInput
                {...field}
                label="Password"
                autoComplete="new-password"
                required={!oidcEnabled}
                error={fieldState.error?.message}
              />
              {!oidcEnabled ? <PasswordStrength value={password ?? ""} /> : null}
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
              required={!oidcEnabled}
              error={fieldState.error?.message}
            />
          )}
        />

        <FormController
          name="acceptTerms"
          control={form.control}
          render={({ field, fieldState }) => (
            <CheckboxField
              name={field.name}
              checked={Boolean(field.value)}
              onCheckedChange={(checked) => field.onChange(checked === true)}
              label="I accept the Terms of Service and Privacy Policy"
              error={fieldState.error?.message}
              required
            />
          )}
        />

        <SubmitButton
          loading={form.isSubmitting || isPending}
          loadingText={oidcEnabled ? "Redirecting…" : "Creating account…"}
        >
          {oidcEnabled ? "Continue to Keycloak" : "Create account"}
        </SubmitButton>
      </AppForm>
    </div>
  );
}

export { RegisterForm };
