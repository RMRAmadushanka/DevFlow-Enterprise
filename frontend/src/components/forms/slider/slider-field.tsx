"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { Slider, SliderControl, SliderTrack, SliderIndicator, SliderThumb } from "@/components/ui/slider";
import { FormField, FormLabel, FormErrorMessage, FormHint } from "@/components/forms/form-layout";
import { useControllableState, useFieldId } from "@/components/forms/shared/hooks";
import type { SliderFieldProps } from "./types";

const defaultFormat = (value: number) => String(value);

/** Single-value or range slider with optional tick marks, built on Base UI's `Slider` (which owns keyboard/drag/collision behavior). */
function SliderField({
  label,
  required,
  disabled,
  error,
  helperText,
  className,
  id,
  name,
  value,
  defaultValue = 0,
  onValueChange,
  min = 0,
  max = 100,
  step = 1,
  marks,
  showValue = true,
  formatValue = defaultFormat,
}: SliderFieldProps) {
  const controlId = useFieldId(id);
  const [internalValue, setInternalValue] = useControllableState<number | number[]>({
    value,
    defaultValue,
    onChange: onValueChange,
  });

  const isRange = Array.isArray(internalValue);
  const displayValue = isRange
    ? `${formatValue(internalValue[0])} – ${formatValue(internalValue[internalValue.length - 1])}`
    : formatValue(internalValue as number);

  // The slider's interactive part is a nested `<input type="range">` inside
  // each `SliderThumb`, not the root `id={controlId}` element, so a
  // `<label htmlFor>` pointing at the root can't give it an accessible name.
  // `getAriaLabel` wires one directly onto each thumb's input instead.
  const labelText = typeof label === "string" ? label : undefined;
  const getThumbAriaLabel = React.useCallback(
    (index: number) => {
      if (!isRange) {
        return labelText ?? "Value";
      }
      return `${labelText ?? "Value"} ${index === 0 ? "minimum" : "maximum"}`;
    },
    [isRange, labelText]
  );

  return (
    <FormField invalid={!!error} disabled={disabled} className={cn("gap-1.5", className)}>
      {label || showValue ? (
        <div className="flex items-center justify-between gap-2">
          {label ? (
            <FormLabel htmlFor={controlId} required={required}>
              {label}
            </FormLabel>
          ) : (
            <span />
          )}
          {showValue ? <span className="text-sm tabular-nums text-muted-foreground">{displayValue}</span> : null}
        </div>
      ) : null}

      <Slider
        id={controlId}
        name={name}
        value={internalValue}
        onValueChange={(next) => setInternalValue(next as number | number[])}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
      >
        <SliderControl>
          <SliderTrack>
            <SliderIndicator />
            {marks?.map((mark) => (
              <span
                key={mark.value}
                aria-hidden="true"
                className="absolute top-1/2 size-1 -translate-y-1/2 rounded-full bg-border"
                style={{ left: `${((mark.value - min) / (max - min)) * 100}%` }}
              />
            ))}
          </SliderTrack>
          {isRange ? (
            (internalValue as number[]).map((_, index) => (
              <SliderThumb key={index} index={index} getAriaLabel={getThumbAriaLabel} />
            ))
          ) : (
            <SliderThumb getAriaLabel={getThumbAriaLabel} />
          )}
        </SliderControl>
        {marks?.some((mark) => mark.label) ? (
          <div className="relative h-4 w-full">
            {marks.map((mark) =>
              mark.label ? (
                <span
                  key={mark.value}
                  className="absolute -translate-x-1/2 text-xs text-muted-foreground"
                  style={{ left: `${((mark.value - min) / (max - min)) * 100}%` }}
                >
                  {mark.label}
                </span>
              ) : null
            )}
          </div>
        ) : null}
      </Slider>

      {error ? <FormErrorMessage>{error}</FormErrorMessage> : helperText ? <FormHint>{helperText}</FormHint> : null}
    </FormField>
  );
}

export { SliderField };
