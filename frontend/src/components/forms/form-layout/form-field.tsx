"use client";

import * as React from "react";
import { Field as FieldPrimitive } from "@base-ui/react/field";

import { cn } from "@/lib/utils";

/**
 * The a11y/state root every field in the system renders inside of. Thin
 * wrapper around Base UI's `Field.Root` — the same headless engine behind
 * every other primitive in `components/ui`. Any Base UI-based control
 * (`Input`, `Select`, `Checkbox`, `Switch`, …) rendered as a descendant
 * auto-wires `id`/`aria-describedby`/`aria-invalid` with `FormLabel`,
 * `FormDescription`, and `FormErrorMessage` — no manual id plumbing.
 *
 * `invalid`/`disabled` are meant to be driven externally (e.g. from React
 * Hook Form's `fieldState`), not derived from native HTML validation.
 */
function FormField({
  className,
  invalid,
  disabled,
  ...props
}: FieldPrimitive.Root.Props) {
  return (
    <FieldPrimitive.Root
      data-slot="form-field"
      invalid={invalid}
      disabled={disabled}
      className={cn("group/form-field flex w-full flex-col gap-1.5", className)}
      {...props}
    />
  );
}

export { FormField };
