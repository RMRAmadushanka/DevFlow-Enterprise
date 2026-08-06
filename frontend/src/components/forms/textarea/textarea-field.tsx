"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { FieldShell } from "@/components/forms/shared/field-shell";
import { useControllableState } from "@/components/forms/shared/hooks";
import type { TextareaFieldProps } from "./types";

/**
 * Multi-line text field. Auto-resize uses CSS `field-sizing: content`
 * (already baked into the base `Textarea` primitive) rather than a
 * JS-measured height — no layout thrash, no ResizeObserver needed.
 */
function TextareaField({
  label,
  required,
  disabled,
  error,
  helperText,
  successText,
  validationState,
  size = "md",
  className,
  id,
  name,
  value,
  defaultValue = "",
  onChange,
  onBlur,
  placeholder,
  readOnly,
  rows = 4,
  minLength,
  maxLength,
  showCounter,
  autoResize = true,
  autoComplete,
  autoFocus,
}: TextareaFieldProps) {
  const [internalValue, setInternalValue] = useControllableState({
    value,
    defaultValue,
    onChange,
  });

  const counterLabel = maxLength ? `${internalValue.length} / ${maxLength}` : undefined;
  const nearLimit = maxLength ? internalValue.length >= maxLength * 0.9 : false;

  return (
    <FieldShell
      label={label}
      required={required}
      disabled={disabled}
      error={error}
      helperText={helperText}
      successText={successText}
      validationState={validationState}
      size={size}
      className={className}
      id={id}
      labelSuffix={showCounter && counterLabel ? counterLabel : undefined}
    >
      {({ controlId, ariaDescribedBy, ariaInvalid }) => (
        <Textarea
          id={controlId}
          name={name}
          value={internalValue}
          onChange={(event) => setInternalValue(event.target.value)}
          onBlur={onBlur}
          placeholder={placeholder}
          disabled={disabled}
          readOnly={readOnly}
          required={required}
          rows={rows}
          minLength={minLength}
          maxLength={maxLength}
          autoComplete={autoComplete}
          autoFocus={autoFocus}
          aria-invalid={ariaInvalid}
          aria-describedby={ariaDescribedBy}
          className={cn(
            !autoResize && "field-sizing-fixed",
            size === "sm" && "text-[0.8rem]",
            size === "lg" && "text-sm",
            nearLimit && "focus-visible:ring-warning/50"
          )}
        />
      )}
    </FieldShell>
  );
}

export { TextareaField };
