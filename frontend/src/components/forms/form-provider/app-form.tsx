"use client";

import * as React from "react";
import { FormProvider } from "react-hook-form";
import type { FieldValues } from "react-hook-form";
import type { z } from "zod";

import { cn } from "@/lib/utils";
import type { AppFormProps } from "./types";

/**
 * Renders the `<form>` element wired to a `useAppForm()` result and puts it
 * in React Hook Form's context via `FormProvider`, so any descendant can
 * use `useAppFormContext()`/`FormController` without prop-drilling `form`.
 *
 * `noValidate` is set so validation UI is always ours (Zod + `FormErrorMessage`),
 * never the browser's native bubble.
 */
function AppForm<TSchema extends z.ZodType<FieldValues>>({
  form,
  children,
  className,
  ...props
}: AppFormProps<TSchema>) {
  return (
    <FormProvider {...form}>
      <form
        data-slot="app-form"
        noValidate
        onSubmit={form.handleFormSubmit}
        className={cn("flex w-full flex-col gap-6", className)}
        {...props}
      >
        {typeof children === "function" ? children(form) : children}
      </form>
    </FormProvider>
  );
}

export { AppForm };
