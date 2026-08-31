"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ChartFilterProps } from "./types";

const ALL_VALUE = "__all__";

/**
 * Multi-dropdown chart/dashboard filter bar.
 */
function ChartFilter({
  filters,
  value,
  onChange,
  className,
  disabled,
  label = "Chart filters",
}: ChartFilterProps) {
  return (
    <div
      data-slot="chart-filter"
      role="group"
      aria-label={label}
      className={cn("flex flex-wrap items-end gap-3", className)}
    >
      {filters.map((filter) => {
        const selected = value[filter.id] ?? null;
        const clearable = filter.clearable !== false;
        const selectValue = selected ?? (clearable ? ALL_VALUE : null);

        // Base UI Select needs `items` so the closed trigger shows labels,
        // not raw values like "org_demo" / "__all__".
        const items = [
          ...(clearable ? [{ value: ALL_VALUE, label: "All" }] : []),
          ...filter.options.map((option) => ({
            value: option.value,
            label: option.label,
          })),
        ];

        return (
          <div key={filter.id} className="flex min-w-36 flex-col gap-1">
            <label
              htmlFor={`chart-filter-${filter.id}`}
              className="text-xs font-medium text-muted-foreground"
            >
              {filter.label}
            </label>
            <Select
              value={selectValue}
              items={items}
              disabled={disabled}
              onValueChange={(next) => {
                const raw = next == null ? null : String(next);
                onChange({
                  ...value,
                  [filter.id]: raw === ALL_VALUE || raw === null ? null : raw,
                });
              }}
            >
              <SelectTrigger id={`chart-filter-${filter.id}`} size="sm" className="w-full">
                <SelectValue placeholder={filter.placeholder ?? "All"} />
              </SelectTrigger>
              <SelectContent>
                {clearable ? <SelectItem value={ALL_VALUE}>All</SelectItem> : null}
                {filter.options.map((option) => (
                  <SelectItem key={option.value} value={option.value} disabled={option.disabled}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );
      })}
    </div>
  );
}

export { ChartFilter };
