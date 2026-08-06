"use client";

import * as React from "react";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { FieldShell } from "@/components/forms/shared/field-shell";
import { useDebouncedValue } from "@/components/forms/shared/hooks";
import { fieldControlSizeClassName } from "@/components/forms/shared/size";
import type { SelectOption } from "@/components/forms/shared/option-types";
import type { ComboboxFieldProps } from "./types";

/**
 * Select-from-a-list control whose options can be loaded asynchronously
 * (`loadOptions`), unlike `SelectField`/`MultiSelectField` which assume a
 * static list up front. Falls back to client-side filtering of `options`
 * when `loadOptions` isn't provided.
 */
function ComboboxField<TValue extends string = string>({
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
  options: staticOptions,
  loadOptions,
  debounceMs = 300,
  value,
  defaultValue = null,
  onValueChange,
  placeholder = "Select an option",
  searchPlaceholder = "Type to search…",
  emptyText = "No results found.",
  loadingText = "Searching…",
}: ComboboxFieldProps<TValue>) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [asyncOptions, setAsyncOptions] = React.useState<SelectOption<TValue>[]>([]);
  const [selectedOption, setSelectedOption] = React.useState<SelectOption<TValue> | null>(null);
  const debouncedQuery = useDebouncedValue(query, debounceMs);
  const requestId = React.useRef(0);

  const [uncontrolledValue, setUncontrolledValue] = React.useState<TValue | null>(defaultValue);
  const isControlled = value !== undefined;
  const internalValue = isControlled ? (value as TValue | null) : uncontrolledValue;

  function selectOption(option: SelectOption<TValue>) {
    setSelectedOption(option);
    if (!isControlled) setUncontrolledValue(option.value);
    onValueChange?.(option.value, option);
    setOpen(false);
  }

  React.useEffect(() => {
    if (!loadOptions || !open) return;
    const id = ++requestId.current;
    setLoading(true);
    loadOptions(debouncedQuery)
      .then((results) => {
        if (requestId.current === id) setAsyncOptions(results);
      })
      .finally(() => {
        if (requestId.current === id) setLoading(false);
      });
  }, [debouncedQuery, loadOptions, open]);

  const options = loadOptions ? asyncOptions : (staticOptions ?? []);
  const selected = selectedOption ?? options.find((option) => option.value === internalValue) ?? null;

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
                  !selected && "text-muted-foreground"
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
            <Command shouldFilter={!loadOptions}>
              <CommandInput
                value={query}
                onValueChange={setQuery}
                placeholder={searchPlaceholder}
              />
              <CommandList>
                {loading ? (
                  <div className="flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground">
                    <Loader2 className="size-4 animate-spin" />
                    {loadingText}
                  </div>
                ) : (
                  <>
                    <CommandEmpty>{emptyText}</CommandEmpty>
                    <CommandGroup>
                      {options.map((option) => (
                        <CommandItem
                          key={option.value}
                          value={`${option.label} ${option.value}`}
                          disabled={option.disabled}
                          onSelect={() => selectOption(option)}
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
                      ))}
                    </CommandGroup>
                  </>
                )}
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      )}
    </FieldShell>
  );
}

export { ComboboxField };
