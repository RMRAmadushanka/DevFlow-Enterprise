"use client";

import * as React from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { FieldShell } from "@/components/forms/shared/field-shell";
import { useControllableState } from "@/components/forms/shared/hooks";
import { fieldControlSizeClassName } from "@/components/forms/shared/size";
import {
  flattenOptions,
  isGroupedOptions,
  type SelectOption,
} from "@/components/forms/shared/option-types";
import type { SelectFieldProps } from "./types";

/**
 * Single-select. Built on `Popover` + `Command` (not the native-feeling
 * `ui/select.tsx`) specifically so search comes for free — `cmdk` owns
 * filtering/keyboard navigation, which the base `Select` primitive doesn't
 * expose. `MultiSelect`, `Combobox`, and `Autocomplete` share this engine.
 */
function SelectField<TValue extends string = string>({
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
  defaultValue = null,
  onValueChange,
  placeholder = "Select an option",
  searchPlaceholder = "Search…",
  emptyText = "No results found.",
  clearable,
}: SelectFieldProps<TValue>) {
  const [open, setOpen] = React.useState(false);
  const [internalValue, setInternalValue] = useControllableState<TValue | null>({
    value,
    defaultValue,
    onChange: onValueChange,
  });

  const flat = flattenOptions(options);
  const selected = flat.find((option) => option.value === internalValue);
  const grouped = isGroupedOptions(options) ? options : null;

  function renderItem(option: SelectOption<TValue>) {
    return (
      <CommandItem
        key={option.value}
        value={`${option.label} ${option.value}`}
        disabled={option.disabled}
        onSelect={() => {
          setInternalValue(option.value);
          setOpen(false);
        }}
      >
        {option.icon}
        <div className="flex flex-col">
          <span>{option.label}</span>
          {option.description ? (
            <span className="text-xs text-muted-foreground">{option.description}</span>
          ) : null}
        </div>
        {internalValue === option.value ? <Check className="ml-auto size-4" /> : null}
      </CommandItem>
    );
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
                    "w-full justify-between font-normal",
                    fieldControlSizeClassName[size],
                    !selected && "text-muted-foreground",
                    clearable && selected && "pr-8"
                  )}
                />
              }
            >
              <span className="flex min-w-0 items-center gap-1.5 truncate">
                {selected?.icon}
                {selected?.label ?? placeholder}
              </span>
              <ChevronsUpDown className="size-3.5 shrink-0 text-muted-foreground" />
            </PopoverTrigger>
            <PopoverContent className="w-(--anchor-width) p-0" align="start">
              <Command>
                <CommandInput placeholder={searchPlaceholder} />
                <CommandList>
                  <CommandEmpty>{emptyText}</CommandEmpty>
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
          {/* A sibling of the trigger, not a child — a focusable control can
              never sit inside another focusable control (WCAG 4.1.2). */}
          {clearable && selected ? (
            <button
              type="button"
              aria-label="Clear selection"
              className="absolute top-1/2 right-8 -translate-y-1/2 rounded-full text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50"
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

export { SelectField };
