"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";

import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { FieldShell } from "@/components/forms/shared/field-shell";
import { useFieldId } from "@/components/forms/shared/hooks";
import { countries, getFlagEmoji } from "@/components/forms/shared/countries";
import { fieldControlSizeClassName } from "@/components/forms/shared/size";
import { cn } from "@/lib/utils";
import { composePhoneValue, splitPhoneValue } from "./utils";
import type { PhoneInputProps } from "./types";

const sortedCountries = [...countries].sort((a, b) => a.name.localeCompare(b.name));

/** Phone number entry with a searchable country/dial-code selector — composes to/from a single E.164 string. */
function PhoneInput({
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
  name,
  value,
  defaultValue = "",
  onValueChange,
  defaultCountry = "US",
  placeholder = "Phone number",
}: PhoneInputProps) {
  const controlId = useFieldId(id);
  const [open, setOpen] = React.useState(false);

  const isControlled = value !== undefined;
  const [uncontrolledFull, setUncontrolledFull] = React.useState(defaultValue);
  const fullValue = isControlled ? value : uncontrolledFull;

  const { countryCode, nationalNumber } = splitPhoneValue(fullValue, defaultCountry);
  const selectedCountry = sortedCountries.find((c) => c.code === countryCode) ?? sortedCountries.find((c) => c.code === defaultCountry)!;

  function emit(nextCountryCode: string, nextNationalNumber: string) {
    const next = composePhoneValue(nextCountryCode, nextNationalNumber);
    if (!isControlled) setUncontrolledFull(next);
    onValueChange?.(next);
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
      {({ ariaDescribedBy, ariaInvalid }) => (
        <InputGroup className={cn(fieldControlSizeClassName[size])}>
          <InputGroupAddon>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger
                render={
                  <InputGroupButton
                    type="button"
                    variant="ghost"
                    disabled={disabled}
                    aria-label={`Country: ${selectedCountry.name}`}
                    className="gap-1 px-1"
                  />
                }
              >
                <span aria-hidden="true">{getFlagEmoji(selectedCountry.code)}</span>
                <span className="text-xs text-muted-foreground">{selectedCountry.dialCode}</span>
                <ChevronDown className="size-3 text-muted-foreground" />
              </PopoverTrigger>
              <PopoverContent className="w-64 p-0" align="start">
                <Command>
                  <CommandInput placeholder="Search countries…" />
                  <CommandList>
                    <CommandEmpty>No countries found.</CommandEmpty>
                    <CommandGroup>
                      {sortedCountries.map((country) => (
                        <CommandItem
                          key={country.code}
                          value={`${country.name} ${country.dialCode} ${country.code}`}
                          onSelect={() => {
                            emit(country.code, nationalNumber);
                            setOpen(false);
                          }}
                        >
                          <span aria-hidden="true">{getFlagEmoji(country.code)}</span>
                          <span className="flex-1">{country.name}</span>
                          <span className="text-xs text-muted-foreground">{country.dialCode}</span>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </InputGroupAddon>
          <InputGroupInput
            id={controlId}
            name={name}
            type="tel"
            inputMode="tel"
            value={nationalNumber}
            onChange={(event) => emit(countryCode, event.target.value.replace(/[^\d]/g, ""))}
            placeholder={placeholder}
            disabled={disabled}
            aria-invalid={ariaInvalid}
            aria-describedby={ariaDescribedBy}
          />
        </InputGroup>
      )}
    </FieldShell>
  );
}

export { PhoneInput };
