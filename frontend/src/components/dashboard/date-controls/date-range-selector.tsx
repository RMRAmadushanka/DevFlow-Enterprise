"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { DateRangePreset } from "@/components/dashboard/shared/types";
import type { DateRangeSelectorProps } from "./types";

const PRESET_LABELS: Record<DateRangePreset, string> = {
  today: "Today",
  "7d": "7 days",
  "30d": "30 days",
  "90d": "90 days",
  custom: "Custom",
};

const DEFAULT_PRESETS: DateRangePreset[] = ["today", "7d", "30d", "90d", "custom"];

/**
 * Chart / dashboard date range control — presets plus optional custom dates.
 */
function DateRangeSelector({
  value,
  onChange,
  presets = DEFAULT_PRESETS,
  className,
  disabled,
  label = "Date range",
  allowCustom = true,
}: DateRangeSelectorProps) {
  const visiblePresets = allowCustom ? presets : presets.filter((p) => p !== "custom");

  return (
    <div
      data-slot="date-range-selector"
      role="group"
      aria-label={label}
      className={cn("flex flex-col gap-2", className)}
    >
      <div className="flex flex-wrap gap-1.5">
        {visiblePresets.map((preset) => {
          const selected = value.preset === preset;
          return (
            <Button
              key={preset}
              type="button"
              size="sm"
              variant={selected ? "secondary" : "outline"}
              disabled={disabled}
              aria-pressed={selected}
              onClick={() => onChange({ ...value, preset })}
            >
              {PRESET_LABELS[preset]}
            </Button>
          );
        })}
      </div>

      {allowCustom && value.preset === "custom" ? (
        <div className="flex flex-wrap items-center gap-2">
          <Input
            type="date"
            aria-label="From date"
            disabled={disabled}
            value={value.from ?? ""}
            onChange={(event) => onChange({ ...value, preset: "custom", from: event.target.value })}
            className="w-auto"
          />
          <span className="text-xs text-muted-foreground">to</span>
          <Input
            type="date"
            aria-label="To date"
            disabled={disabled}
            value={value.to ?? ""}
            onChange={(event) => onChange({ ...value, preset: "custom", to: event.target.value })}
            className="w-auto"
          />
        </div>
      ) : null}
    </div>
  );
}

export { DateRangeSelector };
