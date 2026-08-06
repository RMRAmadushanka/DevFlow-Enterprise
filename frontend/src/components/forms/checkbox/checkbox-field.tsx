"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { FormField, FormErrorMessage } from "@/components/forms/form-layout";
import { useFieldId } from "@/components/forms/shared/hooks";
import type { CheckboxFieldProps } from "./types";

/** A single checkbox with an adjacent label/description — supports the tri-state "indeterminate" visual. */
function CheckboxField({
  label,
  description,
  checked,
  defaultChecked,
  onCheckedChange,
  indeterminate,
  disabled,
  required,
  error,
  name,
  value,
  id,
  className,
  parent,
}: CheckboxFieldProps) {
  const controlId = useFieldId(id);
  const descriptionId = `${controlId}-description`;
  // Inside a `CheckboxGroupField`, Base UI assigns each checkbox its own
  // internal id (derived from the group, not this `controlId`) — so the
  // `<label htmlFor>` below can't reliably reach it there. `aria-label`
  // takes precedence over any native label association, so it stays
  // correctly named in both the standalone and grouped cases.
  const ariaLabel = typeof label === "string" ? label : undefined;

  return (
    <FormField invalid={!!error} disabled={disabled} className={cn("gap-1.5", className)}>
      <div className="flex items-start gap-2.5">
        <Checkbox
          id={controlId}
          name={name}
          value={value}
          checked={checked}
          defaultChecked={defaultChecked}
          onCheckedChange={onCheckedChange}
          indeterminate={indeterminate}
          disabled={disabled}
          required={required}
          parent={parent}
          aria-label={ariaLabel}
          aria-invalid={!!error}
          aria-describedby={description ? descriptionId : undefined}
          className="mt-0.5"
        />
        {(label || description) && (
          <div className="flex flex-col gap-0.5">
            {label ? (
              <label
                htmlFor={controlId}
                className={cn(
                  "text-sm leading-tight font-medium text-foreground select-none",
                  disabled && "pointer-events-none opacity-50"
                )}
              >
                {label}
                {required ? <span className="ml-0.5 text-danger">*</span> : null}
              </label>
            ) : null}
            {description ? (
              <p id={descriptionId} className="text-sm text-muted-foreground">
                {description}
              </p>
            ) : null}
          </div>
        )}
      </div>
      {error ? <FormErrorMessage className="pl-6.5">{error}</FormErrorMessage> : null}
    </FormField>
  );
}

export { CheckboxField };
