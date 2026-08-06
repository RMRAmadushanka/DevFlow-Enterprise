"use client";

import * as React from "react";
import { ArrowDown, ArrowUp, ArrowUpDown, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useControllableState } from "@/components/data-display/shared/hooks";
import type { SortDropdownProps, SortDirection, SortRule } from "./types";

/**
 * Multi-field sort control. Clicking a field toggles asc → desc → off
 * (or replaces the single rule when `multi={false}`). Active rules are
 * mirrored on the trigger as "Created Date ↓ · Priority ↑".
 */
function SortDropdown<TField extends string = string>({
  fields,
  value,
  defaultValue = [],
  onValueChange,
  multi = true,
  label = "Sort",
  disabled,
  className,
}: SortDropdownProps<TField>) {
  const [rules, setRules] = useControllableState<SortRule<TField>[]>({
    value,
    defaultValue,
    onChange: onValueChange,
  });

  const fieldLabel = React.useMemo(
    () => new Map(fields.map((field) => [field.value, field.label])),
    [fields]
  );

  function cycle(field: TField) {
    setRules((prev) => {
      const existing = prev.find((rule) => rule.field === field);
      if (!existing) {
        const next: SortRule<TField> = { field, direction: "asc" };
        return multi ? [...prev, next] : [next];
      }
      if (existing.direction === "asc") {
        const updated = prev.map((rule) =>
          rule.field === field ? { ...rule, direction: "desc" as SortDirection } : rule
        );
        return multi ? updated : updated.filter((rule) => rule.field === field);
      }
      return prev.filter((rule) => rule.field !== field);
    });
  }

  function remove(field: TField) {
    setRules((prev) => prev.filter((rule) => rule.field !== field));
  }

  const triggerLabel =
    rules.length === 0
      ? label
      : rules
          .map((rule) => `${fieldLabel.get(rule.field) ?? rule.field} ${rule.direction === "asc" ? "↑" : "↓"}`)
          .join(" · ");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={disabled}
            className={cn("gap-1.5", className)}
            aria-label={label}
          />
        }
      >
        <ArrowUpDown className="size-3.5" />
        <span className="max-w-[14rem] truncate">{triggerLabel}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Sort by</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {fields.map((field) => {
          const active = rules.find((rule) => rule.field === field.value);
          return (
            <DropdownMenuItem
              key={field.value}
              disabled={field.disabled}
              onClick={() => cycle(field.value)}
              className="justify-between"
            >
              <span className="flex items-center gap-2">
                {field.icon}
                {field.label}
              </span>
              {active ? (
                active.direction === "asc" ? (
                  <ArrowUp className="size-3.5 text-foreground" />
                ) : (
                  <ArrowDown className="size-3.5 text-foreground" />
                )
              ) : null}
            </DropdownMenuItem>
          );
        })}
        {rules.length > 0 ? (
          <>
            <DropdownMenuSeparator />
            {rules.map((rule) => (
              <DropdownMenuItem
                key={`active-${rule.field}`}
                onClick={() => remove(rule.field)}
                className="text-muted-foreground"
              >
                <X className="size-3.5" />
                Clear {fieldLabel.get(rule.field) ?? rule.field}
              </DropdownMenuItem>
            ))}
            <DropdownMenuItem onClick={() => setRules([])}>Clear all</DropdownMenuItem>
          </>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export { SortDropdown };
