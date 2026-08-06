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
import { countries, getFlagEmoji } from "@/components/forms/shared/countries";
import type { CountrySelectFieldProps } from "./types";

const sortedCountries = [...countries].sort((a, b) => a.name.localeCompare(b.name));

/** Country picker — searchable, alphabetical, flag-emoji list built on the shared static `countries` reference data. */
function CountrySelectField({
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
  placeholder = "Select a country",
  clearable,
}: CountrySelectFieldProps) {
  const [open, setOpen] = React.useState(false);
  const [internalValue, setInternalValue] = useControllableState<string | null>({
    value,
    defaultValue,
    onChange: onValueChange,
  });

  const selected = sortedCountries.find((country) => country.code === internalValue);

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
              <span className="flex min-w-0 items-center gap-2 truncate">
                {selected ? <span aria-hidden="true">{getFlagEmoji(selected.code)}</span> : null}
                {selected?.name ?? placeholder}
              </span>
              <ChevronsUpDown className="size-3.5 shrink-0 text-muted-foreground" />
            </PopoverTrigger>
            <PopoverContent className="w-(--anchor-width) p-0" align="start">
              <Command>
                <CommandInput placeholder="Search countries…" />
                <CommandList>
                  <CommandEmpty>No countries found.</CommandEmpty>
                  <CommandGroup>
                    {sortedCountries.map((country) => (
                      <CommandItem
                        key={country.code}
                        value={`${country.name} ${country.code}`}
                        onSelect={() => {
                          setInternalValue(country.code);
                          setOpen(false);
                        }}
                      >
                        <span aria-hidden="true">{getFlagEmoji(country.code)}</span>
                        <span className="flex-1">{country.name}</span>
                        <span className="text-xs text-muted-foreground">{country.dialCode}</span>
                        {internalValue === country.code ? <Check className="ml-1 size-4" /> : null}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
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

export { CountrySelectField };
