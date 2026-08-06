"use client";

import * as React from "react";
import { CalendarIcon, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { FieldShell } from "@/components/forms/shared/field-shell";
import { useControllableState } from "@/components/forms/shared/hooks";
import { buildDisabledMatcher } from "@/components/forms/shared/date-matchers";
import { fieldControlSizeClassName } from "@/components/forms/shared/size";
import type { DatePickerFieldProps } from "./types";

const defaultFormat = (date: Date) => date.toLocaleDateString();

/** Single-date picker: a text trigger + `Calendar` popover, built entirely on `react-day-picker`'s own keyboard/localization support. */
function DatePickerField({
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
  placeholder = "Pick a date",
  minDate,
  maxDate,
  disabledDates,
  locale,
  formatDate = defaultFormat,
}: DatePickerFieldProps) {
  const [open, setOpen] = React.useState(false);
  const [internalValue, setInternalValue] = useControllableState<Date | null>({
    value,
    defaultValue,
    onChange: onValueChange,
  });

  const disabledMatcher = buildDisabledMatcher({ minDate, maxDate, disabledDates });

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
        <div className="relative">
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger
              render={
                <Button
                  id={controlId}
                  type="button"
                  variant="outline"
                  disabled={disabled}
                  aria-invalid={ariaInvalid}
                  aria-describedby={ariaDescribedBy}
                  className={cn(
                    "w-full justify-start gap-2 font-normal",
                    fieldControlSizeClassName[size],
                    !internalValue && "text-muted-foreground",
                    internalValue && "pr-8"
                  )}
                />
              }
            >
              <CalendarIcon className="size-3.5 shrink-0" />
              <span className="flex-1 text-left">
                {internalValue ? formatDate(internalValue) : placeholder}
              </span>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={internalValue ?? undefined}
                onSelect={(date) => {
                  setInternalValue(date ?? null);
                  setOpen(false);
                }}
                disabled={disabledMatcher}
                locale={locale}
                autoFocus
              />
            </PopoverContent>
          </Popover>
          {internalValue ? (
            <button
              type="button"
              aria-label="Clear date"
              className="absolute top-1/2 right-2.5 -translate-y-1/2 rounded-full text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50"
              onClick={() => setInternalValue(null)}
            >
              <X className="size-3.5" />
            </button>
          ) : null}
        </div>
      )}
    </FieldShell>
  );
}

export { DatePickerField };
