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
import { defaultDateRangePresets } from "./presets";
import type { DateRange, DateRangePickerFieldProps } from "./types";

const defaultFormat = (date: Date) => date.toLocaleDateString();
const emptyRange: DateRange = { from: undefined, to: undefined };

/** Start/end date range picker with quick presets (Today, Yesterday, Last 7 days, This month) alongside a dual-month `Calendar`. */
function DateRangePickerField({
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
  placeholder = "Pick a date range",
  minDate,
  maxDate,
  disabledDates,
  locale,
  formatDate = defaultFormat,
  presets = defaultDateRangePresets,
}: DateRangePickerFieldProps) {
  const [open, setOpen] = React.useState(false);
  const [internalValue, setInternalValue] = useControllableState<DateRange | null>({
    value,
    defaultValue,
    onChange: onValueChange,
  });

  const disabledMatcher = buildDisabledMatcher({ minDate, maxDate, disabledDates });
  const range = internalValue ?? emptyRange;

  function displayLabel() {
    if (!range.from) return placeholder;
    if (!range.to) return formatDate(range.from);
    return `${formatDate(range.from)} – ${formatDate(range.to)}`;
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
                    !range.from && "text-muted-foreground",
                    range.from && "pr-8"
                  )}
                />
              }
            >
              <CalendarIcon className="size-3.5 shrink-0" />
              <span className="flex-1 text-left">{displayLabel()}</span>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <div className="flex">
                {presets ? (
                  <div className="flex flex-col gap-0.5 border-r border-border p-2">
                    {presets.map((preset) => (
                      <Button
                        key={preset.label}
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="justify-start font-normal"
                        onClick={() => {
                          setInternalValue(preset.getValue());
                          setOpen(false);
                        }}
                      >
                        {preset.label}
                      </Button>
                    ))}
                  </div>
                ) : null}
                <Calendar
                  mode="range"
                  numberOfMonths={2}
                  selected={range.from ? range : undefined}
                  onSelect={(next) => setInternalValue(next ?? null)}
                  disabled={disabledMatcher}
                  locale={locale}
                  autoFocus
                />
              </div>
            </PopoverContent>
          </Popover>
          {range.from ? (
            <button
              type="button"
              aria-label="Clear date range"
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

export { DateRangePickerField };
