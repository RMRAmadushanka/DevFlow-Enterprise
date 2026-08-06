import type * as React from "react";
import type { DefaultValues, FieldValues, UseFormProps, UseFormReturn } from "react-hook-form";
import type { z } from "zod";

export type FormMode = NonNullable<UseFormProps["mode"]>;

export interface UseAppFormOptions<TSchema extends z.ZodType<FieldValues>> {
  /** Zod schema — the single source of truth for both types and validation. */
  schema: TSchema;
  defaultValues: DefaultValues<z.infer<TSchema>>;
  /**
   * When to run validation. @default "onBlur" — validates once a field is
   * left, then re-validates on every change (React Hook Form's default
   * re-validation behavior), balancing real-time feedback with not
   * scolding the user mid-keystroke on the very first pass.
   */
  mode?: FormMode;
  /** Called with the parsed, type-safe values once validation passes. May be async. */
  onSubmit: (values: z.infer<TSchema>) => void | Promise<void>;
  /** Called if `onSubmit` throws/rejects — e.g. to show a toast. */
  onError?: (error: unknown) => void;
  /**
   * Registers this form's dirty state with `useFormDirtyStore` under this
   * key, so e.g. a navbar can warn about unsaved changes across the whole
   * app. Omit for forms that don't need cross-app dirty tracking.
   */
  formId?: string;
}

export interface UseAppFormReturn<TSchema extends z.ZodType<FieldValues>> extends UseFormReturn<z.infer<TSchema>> {
  /** Mirrors `formState.isSubmitting` for convenience. */
  isSubmitting: boolean;
  /** Set when `onSubmit` throws — cleared on the next submit attempt. */
  submitError: string | null;
  /** Pass directly to `<form onSubmit={...}>` (this is what `AppForm` does internally). */
  handleFormSubmit: (event?: React.BaseSyntheticEvent) => Promise<void>;
}

export interface AppFormProps<TSchema extends z.ZodType<FieldValues>>
  extends Omit<React.ComponentProps<"form">, "onSubmit" | "children"> {
  form: UseAppFormReturn<TSchema>;
  children: React.ReactNode | ((form: UseAppFormReturn<TSchema>) => React.ReactNode);
}
