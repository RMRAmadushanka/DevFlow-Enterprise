"use client";

import * as React from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { FieldShell } from "@/components/forms/shared/field-shell";
import { useControllableState } from "@/components/forms/shared/hooks";
import { flattenOptions, isGroupedOptions, type SelectOption } from "@/components/forms/shared/option-types";
import type { MultiSelectFieldProps } from "./types";

/** Multi-select with checkbox items, removable tag chips, "select all", and an optional selection cap. */
function MultiSelectField<TValue extends string = string>({
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
  options,
  value,
  defaultValue = [],
  onValueChange,
  placeholder = "Select options",
  searchPlaceholder = "Search…",
  emptyText = "No results found.",
  maxSelected,
  showSelectAll = true,
}: MultiSelectFieldProps<TValue>) {
  const listboxId = React.useId();
  const [open, setOpen] = React.useState(false);
  const [internalValue, setInternalValue] = useControllableState<TValue[]>({
    value,
    defaultValue,
    onChange: onValueChange,
  });

  const flat = flattenOptions(options);
  const grouped = isGroupedOptions(options) ? options : null;
  const selectedOptions = flat.filter((option) => internalValue.includes(option.value));
  const atMax = maxSelected !== undefined && internalValue.length >= maxSelected;

  function toggle(optionValue: TValue) {
    setInternalValue(
      internalValue.includes(optionValue)
        ? internalValue.filter((v) => v !== optionValue)
        : atMax
          ? internalValue
          : [...internalValue, optionValue]
    );
  }

  function remove(optionValue: TValue, event?: React.MouseEvent) {
    event?.stopPropagation();
    setInternalValue(internalValue.filter((v) => v !== optionValue));
  }

  function renderItem(option: SelectOption<TValue>) {
    const checked = internalValue.includes(option.value);
    return (
      <CommandItem
        key={option.value}
        value={`${option.label} ${option.value}`}
        disabled={option.disabled || (!checked && atMax)}
        onSelect={() => toggle(option.value)}
      >
        <span
          className={cn(
            "flex size-4 shrink-0 items-center justify-center rounded-[4px] border border-input",
            checked && "border-primary bg-primary text-primary-foreground"
          )}
          aria-hidden="true"
        >
          {checked ? <Check className="size-3" /> : null}
        </span>
        {option.icon}
        {option.label}
      </CommandItem>
    );
  }

  return (
    <FieldShell
      label={label}
      required={required}
      disabled={disabled}
      error={error}
      helperText={
        helperText ?? (maxSelected ? `${internalValue.length} of ${maxSelected} selected` : undefined)
      }
      successText={successText}
      validationState={validationState}
      size={size}
      className={className}
      id={id}
    >
      {({ controlId, ariaDescribedBy, ariaInvalid, ariaLabelledBy }) => (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger
            disabled={disabled}
            nativeButton={false}
            render={
              // Rendered as a `<div role="combobox">`, not a `<button>` — the
              // per-chip remove buttons below are focusable descendants, and
              // a `<button>` can never contain another interactive control
              // without violating WCAG 4.1.2 ("nested-interactive").
              <div
                id={controlId}
                role="combobox"
                aria-expanded={open}
                aria-controls={listboxId}
                aria-invalid={ariaInvalid}
                aria-describedby={ariaDescribedBy}
                aria-labelledby={ariaLabelledBy}
                className={cn(
                  "flex min-h-8 w-full flex-wrap items-center gap-1.5 rounded-lg border border-input bg-transparent px-2.5 py-1.5 text-left text-sm transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-disabled:cursor-not-allowed aria-disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:bg-input/30"
                )}
              />
            }
          >
            {selectedOptions.length ? (
              selectedOptions.map((option) => (
                <Badge key={option.value} variant="secondary" className="gap-1">
                  {option.label}
                  <button
                    type="button"
                    aria-label={`Remove ${option.label}`}
                    className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                    onClick={(event) => remove(option.value, event)}
                  >
                    <X className="size-3" />
                  </button>
                </Badge>
              ))
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
            <ChevronsUpDown className="ml-auto size-3.5 shrink-0 self-center text-muted-foreground" />
          </PopoverTrigger>
          <PopoverContent className="w-(--anchor-width) p-0" align="start">
            <Command>
              <CommandInput placeholder={searchPlaceholder} />
              <CommandList id={listboxId}>
                <CommandEmpty>{emptyText}</CommandEmpty>
                {showSelectAll ? (
                  <>
                    <CommandGroup>
                      <CommandItem
                        onSelect={() => {
                          const allValues = flat.filter((o) => !o.disabled).map((o) => o.value);
                          const allSelected = allValues.every((v) => internalValue.includes(v));
                          setInternalValue(
                            allSelected
                              ? []
                              : maxSelected
                                ? allValues.slice(0, maxSelected)
                                : allValues
                          );
                        }}
                      >
                        <span
                          className={cn(
                            "flex size-4 shrink-0 items-center justify-center rounded-[4px] border border-input",
                            internalValue.length > 0 && "border-primary bg-primary text-primary-foreground"
                          )}
                          aria-hidden="true"
                        >
                          {internalValue.length > 0 ? <Check className="size-3" /> : null}
                        </span>
                        Select all
                      </CommandItem>
                    </CommandGroup>
                    <CommandSeparator />
                  </>
                ) : null}
                {grouped
                  ? grouped.map((group) => (
                      <CommandGroup key={group.label} heading={group.label}>
                        {group.options.map(renderItem)}
                      </CommandGroup>
                    ))
                  : flat.map(renderItem)}
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      )}
    </FieldShell>
  );
}

export { MultiSelectField };
