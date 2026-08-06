"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import {
  NumberField,
  NumberFieldGroup,
  NumberFieldInput,
  NumberFieldDecrement,
  NumberFieldIncrement,
} from "@/components/ui/number-field";
import { FieldShell } from "@/components/forms/shared/field-shell";
import type { NumberInputProps } from "./types";

/**
 * Numeric input built on Base UI's `NumberField` — increment/decrement,
 * keyboard stepping (arrows, Page Up/Down, Home/End), and locale-aware
 * formatting all come from the primitive for free. `mode="currency"` gives
 * a quick currency-formatted number; for a full currency-picker experience
 * see `components/forms/currency-input`.
 */
function NumberInput({
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
  defaultValue,
  onChange,
  onBlur,
  placeholder,
  min,
  max,
  step,
  allowNegative = true,
  decimalPlaces,
  mode = "decimal",
  currencyCode = "USD",
  locale,
  showStepper = true,
}: NumberInputProps) {
  const resolvedMin = min ?? (mode === "percentage" ? 0 : allowNegative ? undefined : 0);
  const resolvedMax = max ?? (mode === "percentage" ? 100 : undefined);
  const resolvedStep = step ?? (decimalPlaces ? 1 / 10 ** decimalPlaces : 1);

  const format: Intl.NumberFormatOptions | undefined =
    mode === "currency"
      ? {
          style: "currency",
          currency: currencyCode,
          minimumFractionDigits: decimalPlaces ?? 2,
          maximumFractionDigits: decimalPlaces ?? 2,
        }
      : decimalPlaces !== undefined
        ? { minimumFractionDigits: decimalPlaces, maximumFractionDigits: decimalPlaces }
        : undefined;

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
        <NumberField
          id={controlId}
          name={name}
          value={value ?? null}
          defaultValue={defaultValue}
          onValueChange={(next) => onChange?.(next)}
          min={resolvedMin}
          max={resolvedMax}
          step={resolvedStep}
          format={format}
          locale={locale}
          disabled={disabled}
          required={required}
        >
          <NumberFieldGroup
            className={cn(
              size === "sm" && "h-7 text-[0.8rem]",
              size === "lg" && "h-9 text-sm",
              ariaInvalid && "border-destructive ring-3 ring-destructive/20"
            )}
          >
            {showStepper ? <NumberFieldDecrement disabled={disabled} /> : null}
            {mode === "percentage" ? (
              <div className="flex h-full flex-1 items-center">
                <NumberFieldInput
                  onBlur={onBlur}
                  placeholder={placeholder}
                  aria-invalid={ariaInvalid}
                  aria-describedby={ariaDescribedBy}
                />
                <span className="pr-2.5 text-sm text-muted-foreground" aria-hidden="true">
                  %
                </span>
              </div>
            ) : (
              <NumberFieldInput
                onBlur={onBlur}
                placeholder={placeholder}
                aria-invalid={ariaInvalid}
                aria-describedby={ariaDescribedBy}
              />
            )}
            {showStepper ? <NumberFieldIncrement disabled={disabled} /> : null}
          </NumberFieldGroup>
        </NumberField>
      )}
    </FieldShell>
  );
}

export { NumberInput };
