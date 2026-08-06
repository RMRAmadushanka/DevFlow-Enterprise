"use client";

import * as React from "react";
import { CheckboxGroup as CheckboxGroupPrimitive } from "@base-ui/react/checkbox-group";

import { cn } from "@/lib/utils";
import { FormGroup, FormField, FormErrorMessage, FormHint } from "@/components/forms/form-layout";
import { CheckboxField } from "./checkbox-field";
import type { CheckboxGroupFieldProps } from "./types";

/**
 * A set of checkboxes sharing one value array, built on Base UI's
 * `CheckboxGroup` — the optional "Select all" row's indeterminate state is
 * computed by the primitive itself from `allValues`, not hand-rolled.
 */
function CheckboxGroupField({
  label,
  description,
  options,
  value,
  defaultValue = [],
  onValueChange,
  showSelectAll,
  orientation = "vertical",
  disabled,
  error,
  helperText,
  className,
}: CheckboxGroupFieldProps) {
  const allValues = options.map((option) => option.value);

  return (
    <FormGroup legend={label} description={description} disabled={disabled} className={className}>
      <div className="flex flex-col gap-2.5">
        <CheckboxGroupPrimitive
          value={value}
          defaultValue={defaultValue}
          onValueChange={onValueChange}
          allValues={allValues}
          disabled={disabled}
        >
          <div className={cn("flex gap-3", orientation === "horizontal" ? "flex-row flex-wrap" : "flex-col")}>
            {showSelectAll ? (
              <CheckboxField label="Select all" parent disabled={disabled} className="pb-1" />
            ) : null}
            {options.map((option) => (
              <CheckboxField
                key={option.value}
                name={option.value}
                label={option.label}
                description={option.description}
                disabled={disabled || option.disabled}
              />
            ))}
          </div>
        </CheckboxGroupPrimitive>
        {/* `FormErrorMessage` needs `Field.Root` context, which `FormGroup`
            (a `Fieldset.Root`) doesn't itself provide — nest one here, scoped
            to just the message so its `LabelableContext` doesn't leak into
            the checkbox items above and collide their individually-assigned ids. */}
        {error ? (
          <FormField invalid className="gap-0">
            <FormErrorMessage>{error}</FormErrorMessage>
          </FormField>
        ) : helperText ? (
          <FormHint>{helperText}</FormHint>
        ) : null}
      </div>
    </FormGroup>
  );
}

export { CheckboxGroupField };
