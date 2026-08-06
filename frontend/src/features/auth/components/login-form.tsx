"use client";

import * as React from "react";
import Link from "next/link";

import {
  AppForm,
  FormController,
  useAppForm,
} from "@/components/forms/form-provider";
import { TextInput } from "@/components/forms/input";
import { PasswordInput } from "@/components/forms/password";
import { CheckboxField } from "@/components/forms/checkbox";
import { SubmitButton } from "@/components/forms/form-actions";
import { AlertBanner } from "@/components/feedback/alert";
import { routes } from "@/config/routes";

import { DEMO_CREDENTIALS } from "../constants/auth.constants";
import { useLogin } from "../hooks/use-login";
import { loginSchema, type LoginFormValues } from "../schemas/auth.schema";
import { SocialLoginButtons } from "./social-login-buttons";

function LoginForm() {
  const { login, socialLogin, isPending, errorMessage, reset } = useLogin();

  const form = useAppForm({
    schema: loginSchema,
    defaultValues: {
      email: DEMO_CREDENTIALS.email,
      password: "",
      rememberMe: true,
    } satisfies LoginFormValues,
    mode: "onSubmit",
    onSubmit: async (values) => {
      reset();
      await login({
        email: values.email,
        password: values.password,
        rememberMe: values.rememberMe,
      });
    },
  });

  return (
    <div className="flex flex-col gap-6">
      {errorMessage || form.submitError ? (
        <AlertBanner
          tone="error"
          title="Sign-in failed"
          description={errorMessage ?? form.submitError ?? undefined}
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
        <FormController
          name="password"
          control={form.control}
          render={({ field, fieldState }) => (
            <PasswordInput
              {...field}
              label="Password"
              autoComplete="current-password"
              required
              error={fieldState.error?.message}
            />
          )}
        />

        <div className="flex items-center justify-between gap-3">
          <FormController
            name="rememberMe"
            control={form.control}
            render={({ field }) => (
              <CheckboxField
                name={field.name}
                checked={Boolean(field.value)}
                onCheckedChange={(checked) => field.onChange(checked === true)}
                label="Remember me"
              />
            )}
          />
          <Link
            href={routes.auth.forgotPassword}
            className="text-sm font-medium text-primary hover:underline"
          >
            Forgot password?
          </Link>
        </div>

        <SubmitButton loading={form.isSubmitting || isPending} loadingText="Signing in…">
          Sign in
        </SubmitButton>
      </AppForm>

      <div className="relative py-1 text-center text-xs text-muted-foreground">
        <span className="bg-card px-2 relative z-10">Or continue with</span>
        <span className="absolute inset-x-0 top-1/2 h-px bg-border" aria-hidden="true" />
      </div>

      <SocialLoginButtons
        disabled={isPending || form.isSubmitting}
        onProviderSelect={async (provider) => {
          await socialLogin(provider);
        }}
      />

      <p className="text-center text-xs text-muted-foreground">
        Demo: {DEMO_CREDENTIALS.email} / {DEMO_CREDENTIALS.password}
      </p>
    </div>
  );
}

export { LoginForm };
