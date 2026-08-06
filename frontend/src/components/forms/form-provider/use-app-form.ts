"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import type { FieldValues, Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";

import { useFormDirtyStore } from "./form-dirty-store";
import type { UseAppFormOptions, UseAppFormReturn } from "./types";

/**
 * The Enterprise Form System's foundation hook. Wraps React Hook Form's
 * `useForm` with:
 *  - Zod resolver wiring (schema is the single source of truth for types + validation)
 *  - async submit handling (loading state + caught-error surface, so a
 *    failed API call renders through `FormErrorMessage`/`FormFooter` instead
 *    of an unhandled promise rejection)
 *  - optional cross-app "unsaved changes" registration via `formId`
 *
 * @example
 * const schema = z.object({ email: z.string().email() });
 * const form = useAppForm({
 *   schema,
 *   defaultValues: { email: "" },
 *   onSubmit: async (values) => api.updateEmail(values),
 * });
 * return <AppForm form={form}>...</AppForm>;
 */
function useAppForm<TSchema extends z.ZodType<FieldValues>>({
  schema,
  defaultValues,
  mode = "onBlur",
  onSubmit,
  onError,
  formId,
}: UseAppFormOptions<TSchema>): UseAppFormReturn<TSchema> {
  const form = useForm<z.infer<TSchema>>({
    // `zodResolver`'s overloads can't be resolved against a bare `TSchema`
    // type parameter (only against a concrete Zod schema type), so both the
    // call and its result are cast — the outer cast restores the real,
    // schema-derived type that `useForm<z.infer<TSchema>>` above expects.
    resolver: zodResolver(schema as z.ZodType<FieldValues, FieldValues>) as unknown as Resolver<
      z.infer<TSchema>
    >,
    defaultValues,
    mode,
  });

  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const setFormDirty = useFormDirtyStore((state) => state.setFormDirty);
  const clearForm = useFormDirtyStore((state) => state.clearForm);

  const isDirty = form.formState.isDirty;
  React.useEffect(() => {
    if (!formId) return;
    setFormDirty(formId, isDirty);
  }, [formId, isDirty, setFormDirty]);

  React.useEffect(() => {
    if (!formId) return;
    return () => clearForm(formId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formId]);

  const handleFormSubmit = form.handleSubmit(async (values) => {
    setSubmitError(null);
    try {
      await onSubmit(values as z.infer<TSchema>);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Something went wrong. Please try again.";
      setSubmitError(message);
      onError?.(error);
    }
  });

  return {
    ...form,
    isSubmitting: form.formState.isSubmitting,
    submitError,
    handleFormSubmit,
  };
}

export { useAppForm };
