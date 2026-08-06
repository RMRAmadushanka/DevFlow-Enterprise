"use client";

import * as React from "react";
import { Clock } from "lucide-react";

import { cn } from "@/lib/utils";
import { NumberField, NumberFieldInput } from "@/components/ui/number-field";
import { Button } from "@/components/ui/button";
import { FieldShell } from "@/components/forms/shared/field-shell";
import { useControllableState } from "@/components/forms/shared/hooks";
import type { TimePickerFieldProps, TimeValue } from "./types";

const twoDigits = { minimumIntegerDigits: 2 } as const;
const defaultTime: TimeValue = { hours: 0, minutes: 0, seconds: 0 };

function to12Hour(hours: number) {
  const period: "AM" | "PM" = hours >= 12 ? "PM" : "AM";
  const twelveHour = hours % 12 === 0 ? 12 : hours % 12;
  return { twelveHour, period };
}

function from12Hour(twelveHour: number, period: "AM" | "PM") {
  const clamped = twelveHour % 12;
  return period === "PM" ? clamped + 12 : clamped;
}

/** Segmented hour/minute[/second] time entry — each segment is a `NumberField` for native arrow-key increment/decrement and typed entry. */
function TimePickerField({
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
  defaultValue = null,
  onValueChange,
  hourFormat = "24",
  showSeconds,
  minuteStep = 1,
}: TimePickerFieldProps) {
  const [internalValue, setInternalValue] = useControllableState<TimeValue | null>({
    value,
    defaultValue,
    onChange: onValueChange,
  });

  const time = internalValue ?? defaultTime;
  const { twelveHour, period } = to12Hour(time.hours);

  function update(patch: Partial<TimeValue>) {
    setInternalValue({ ...time, ...patch });
  }

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
      {({ controlId, ariaDescribedBy, ariaInvalid, ariaLabelledBy }) => (
        <div
          id={controlId}
          role="group"
          aria-describedby={ariaDescribedBy}
          aria-labelledby={ariaLabelledBy}
          data-invalid={ariaInvalid || undefined}
          data-disabled={disabled || undefined}
          className={cn(
            "flex h-9 w-fit items-center gap-1 rounded-lg border border-input bg-transparent px-2 transition-colors focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50 data-invalid:border-destructive data-invalid:ring-3 data-invalid:ring-destructive/20 data-disabled:opacity-50 dark:bg-input/30"
          )}
        >
          <Clock className="size-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
          <NumberField
            value={hourFormat === "12" ? twelveHour : time.hours}
            onValueChange={(next) => {
              if (next == null) return;
              update({ hours: hourFormat === "12" ? from12Hour(next, period) : next });
            }}
            min={hourFormat === "12" ? 1 : 0}
            max={hourFormat === "12" ? 12 : 23}
            format={twoDigits}
            disabled={disabled}
          >
            <NumberFieldInput
              aria-label="Hours"
              className="h-full w-6 p-0 text-center tabular-nums"
            />
          </NumberField>
          <span className="text-muted-foreground">:</span>
          <NumberField
            value={time.minutes}
            onValueChange={(next) => next != null && update({ minutes: next })}
            min={0}
            max={59}
            step={minuteStep}
            format={twoDigits}
            disabled={disabled}
          >
            <NumberFieldInput
              aria-label="Minutes"
              className="h-full w-6 p-0 text-center tabular-nums"
            />
          </NumberField>
          {showSeconds ? (
            <>
              <span className="text-muted-foreground">:</span>
              <NumberField
                value={time.seconds ?? 0}
                onValueChange={(next) => next != null && update({ seconds: next })}
                min={0}
                max={59}
                format={twoDigits}
                disabled={disabled}
              >
                <NumberFieldInput
                  aria-label="Seconds"
                  className="h-full w-6 p-0 text-center tabular-nums"
                />
              </NumberField>
            </>
          ) : null}
          {hourFormat === "12" ? (
            <div className="ml-1 flex overflow-hidden rounded-md border border-input">
              {(["AM", "PM"] as const).map((option) => (
                <Button
                  key={option}
                  type="button"
                  size="sm"
                  variant="ghost"
                  disabled={disabled}
                  onClick={() => update({ hours: from12Hour(twelveHour, option) })}
                  className={cn(
                    "h-7 rounded-none px-2 text-xs",
                    period === option && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground"
                  )}
                >
                  {option}
                </Button>
              ))}
            </div>
          ) : null}
        </div>
      )}
    </FieldShell>
  );
}

export { TimePickerField };
