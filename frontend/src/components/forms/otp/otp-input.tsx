"use client";

import * as React from "react";
import { Minus } from "lucide-react";

import { OTPField, OTPFieldInput } from "@/components/ui/otp-field";
import { FieldShell } from "@/components/forms/shared/field-shell";
import type { OTPFieldProps } from "./types";

/**
 * One-time-passcode entry. Auto-focus, auto-advance, and paste-to-fill are
 * all handled natively by Base UI's `OTPField` — this wrapper only adds
 * field chrome (label/error) and optional visual grouping (e.g. "123 456").
 */
function OTPInput({
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
  value,
  defaultValue,
  onValueChange,
  onComplete,
  length = 6,
  mask,
  groupAfter,
  autoFocus,
}: OTPFieldProps) {
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
    >
      {({ controlId, ariaDescribedBy, ariaInvalid }) => (
        <OTPField
          id={controlId}
          length={length}
          value={value}
          defaultValue={defaultValue}
          onValueChange={(next) => onValueChange?.(next)}
          onValueComplete={(next) => onComplete?.(next)}
          disabled={disabled}
          required={required}
          mask={mask}
          aria-invalid={ariaInvalid}
          aria-describedby={ariaDescribedBy}
        >
          {Array.from({ length }).map((_, index) => (
            <React.Fragment key={index}>
              <OTPFieldInput autoFocus={autoFocus && index === 0} />
              {groupAfter?.includes(index + 1) && index !== length - 1 ? (
                <Minus className="size-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
              ) : null}
            </React.Fragment>
          ))}
        </OTPField>
      )}
    </FieldShell>
  );
}

export { OTPInput };
