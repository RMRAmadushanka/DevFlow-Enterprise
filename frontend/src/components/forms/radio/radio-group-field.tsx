"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { FormGroup, FormField, FormErrorMessage, FormHint } from "@/components/forms/form-layout";
import { useFieldId } from "@/components/forms/shared/hooks";
import type { RadioGroupFieldProps } from "./types";

/** A set of mutually-exclusive options. `orientation="cards"` renders each option as a selectable, clickable card. */
function RadioGroupField({
  label,
  description,
  options,
  value,
  defaultValue,
  onValueChange,
  orientation = "vertical",
  disabled,
  required,
  error,
  helperText,
  name,
  className,
}: RadioGroupFieldProps) {
  const baseId = useFieldId();

  return (
    <FormGroup legend={label} description={description} disabled={disabled} className={className}>
      <div className="flex flex-col gap-2.5">
        <RadioGroup
          name={name}
          value={value}
          defaultValue={defaultValue}
          onValueChange={(next) => onValueChange?.(next as string)}
          disabled={disabled}
          required={required}
          aria-invalid={!!error}
          className={cn(
            orientation === "horizontal" && "flex flex-row flex-wrap gap-4",
            orientation === "cards" && "grid grid-cols-1 gap-3 sm:grid-cols-2"
          )}
        >
          {options.map((option) => {
            const itemId = `${baseId}-${option.value}`;
            const isDisabled = disabled || option.disabled;

            if (orientation === "cards") {
              return (
                <label
                  key={option.value}
                  htmlFor={itemId}
                  className={cn(
                    "flex cursor-pointer items-start gap-2.5 rounded-lg border border-input p-3 transition-colors has-[[data-checked]]:border-primary has-[[data-checked]]:bg-primary-muted has-[[data-checked]]:ring-1 has-[[data-checked]]:ring-primary",
                    isDisabled && "pointer-events-none opacity-50"
                  )}
                >
                  <RadioGroupItem id={itemId} value={option.value} disabled={isDisabled} className="mt-0.5" />
                  <div className="flex flex-1 flex-col gap-0.5">
                    <span className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                      {option.icon}
                      {option.label}
                    </span>
                    {option.description ? (
                      <span className="text-xs text-muted-foreground">{option.description}</span>
                    ) : null}
                  </div>
                </label>
              );
            }

            return (
              <div key={option.value} className="flex items-start gap-2.5">
                <RadioGroupItem id={itemId} value={option.value} disabled={isDisabled} className="mt-0.5" />
                <label
                  htmlFor={itemId}
                  className={cn(
                    "flex flex-col gap-0.5 text-sm select-none",
                    isDisabled && "pointer-events-none opacity-50"
                  )}
                >
                  <span className="flex items-center gap-1.5 font-medium text-foreground">
                    {option.icon}
                    {option.label}
                  </span>
                  {option.description ? (
                    <span className="text-xs text-muted-foreground">{option.description}</span>
                  ) : null}
                </label>
              </div>
            );
          })}
        </RadioGroup>
        {/* `FormErrorMessage` needs `Field.Root` context, which `FormGroup`
            (a `Fieldset.Root`) doesn't itself provide — nest one here, scoped
            to just the message so its `LabelableContext` doesn't leak into
            the radio items above and collide their individually-assigned ids. */}
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

export { RadioGroupField };
