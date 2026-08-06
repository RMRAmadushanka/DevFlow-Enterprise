"use client";

import * as React from "react";

import { NumberField, NumberFieldGroup, NumberFieldInput } from "@/components/ui/number-field";
import { FieldShell } from "@/components/forms/shared/field-shell";
import { useControllableState } from "@/components/forms/shared/hooks";
import { cn } from "@/lib/utils";
import type { CurrencyInputProps } from "./types";

function getCurrencySymbol(locale: string | undefined, currencyCode: string) {
  const parts = new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currencyCode,
    currencyDisplay: "narrowSymbol",
  }).formatToParts(0);
  return parts.find((part) => part.type === "currency")?.value ?? currencyCode;
}

function getFractionDigits(currencyCode: string) {
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency: currencyCode }).resolvedOptions()
      .maximumFractionDigits;
  } catch {
    return 2;
  }
}

/**
 * Localized monetary amount entry — a locale-aware currency symbol prefix
 * (via `Intl.NumberFormat`) paired with a plain grouped-decimal `NumberField`
 * so typing never fights the currency formatting.
 */
function CurrencyInputField({
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
  defaultValue = null,
  onValueChange,
  currencyCode = "USD",
  locale,
  min,
  max,
  allowNegative = false,
  placeholder = "0.00",
}: CurrencyInputProps) {
  const [internalValue, setInternalValue] = useControllableState<number | null>({
    value,
    defaultValue,
    onChange: onValueChange,
  });

  const fractionDigits = getFractionDigits(currencyCode);
  const symbol = getCurrencySymbol(locale, currencyCode);

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
          value={internalValue}
          onValueChange={setInternalValue}
          min={min ?? (allowNegative ? undefined : 0)}
          max={max}
          locale={locale}
          format={{ minimumFractionDigits: fractionDigits, maximumFractionDigits: fractionDigits }}
          disabled={disabled}
          aria-invalid={ariaInvalid}
          aria-describedby={ariaDescribedBy}
        >
          <NumberFieldGroup className={cn(ariaInvalid && "border-destructive ring-3 ring-destructive/20")}>
            <span className="pl-2.5 text-sm font-medium text-muted-foreground select-none">{symbol}</span>
            <NumberFieldInput placeholder={placeholder} className="pl-1.5" />
          </NumberFieldGroup>
        </NumberField>
      )}
    </FieldShell>
  );
}

export { CurrencyInputField };
