"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { InputGroup, InputGroupInput } from "@/components/ui/input-group";
import { FieldShell } from "@/components/forms/shared/field-shell";
import { useControllableState, useDebouncedValue } from "@/components/forms/shared/hooks";
import { fieldControlSizeClassName } from "@/components/forms/shared/size";
import { dropdownContent } from "@/design-system/motion/variants";
import type { SelectOption } from "@/components/forms/shared/option-types";
import type { AutocompleteFieldProps } from "./types";

/**
 * Freeform text input with a debounced suggestion dropdown. Unlike
 * `ComboboxField`, the field's value is whatever the user typed — picking a
 * suggestion just fills the text, it doesn't gate what counts as "valid".
 */
function AutocompleteField({
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
  onChange,
  onSelectSuggestion,
  fetchSuggestions,
  debounceMs = 300,
  placeholder,
  emptyText = "No suggestions",
  minChars = 1,
}: AutocompleteFieldProps) {
  const [internalValue, setInternalValue] = useControllableState({ value, defaultValue, onChange });
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [suggestions, setSuggestions] = React.useState<SelectOption[]>([]);
  const [highlighted, setHighlighted] = React.useState(0);
  const debounced = useDebouncedValue(internalValue, debounceMs);
  const requestId = React.useRef(0);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const listboxId = React.useId();

  React.useEffect(() => {
    if (debounced.trim().length < minChars) {
      setSuggestions([]);
      return;
    }
    const id = ++requestId.current;
    setLoading(true);
    fetchSuggestions(debounced)
      .then((results) => {
        if (requestId.current === id) {
          setSuggestions(results);
          setHighlighted(0);
        }
      })
      .finally(() => {
        if (requestId.current === id) setLoading(false);
      });
  }, [debounced, fetchSuggestions, minChars]);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function pick(suggestion: SelectOption) {
    setInternalValue(suggestion.label);
    onSelectSuggestion?.(suggestion);
    setOpen(false);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (!open || suggestions.length === 0) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setHighlighted((i) => (i + 1) % suggestions.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setHighlighted((i) => (i - 1 + suggestions.length) % suggestions.length);
    } else if (event.key === "Enter") {
      event.preventDefault();
      pick(suggestions[highlighted]);
    } else if (event.key === "Escape") {
      setOpen(false);
    }
  }

  const showDropdown = open && (internalValue.trim().length >= minChars);

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
      contentClassName="relative"
    >
      {({ controlId, ariaDescribedBy, ariaInvalid }) => (
        <div ref={containerRef} className="relative">
          <InputGroup className={fieldControlSizeClassName[size]}>
            <InputGroupInput
              id={controlId}
              name={name}
              role="combobox"
              aria-expanded={showDropdown}
              aria-controls={listboxId}
              aria-autocomplete="list"
              aria-activedescendant={
                showDropdown && suggestions[highlighted] ? `${listboxId}-${highlighted}` : undefined
              }
              value={internalValue}
              onChange={(event) => {
                setInternalValue(event.target.value);
                setOpen(true);
              }}
              onFocus={() => setOpen(true)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={disabled}
              required={required}
              autoComplete="off"
              aria-invalid={ariaInvalid}
              aria-describedby={ariaDescribedBy}
            />
            {loading ? <Loader2 className="mr-2.5 size-4 shrink-0 animate-spin text-muted-foreground" /> : null}
          </InputGroup>
          <AnimatePresence>
            {showDropdown ? (
              <motion.ul
                id={listboxId}
                role="listbox"
                variants={dropdownContent}
                initial="initial"
                animate="animate"
                exit="exit"
                className="absolute z-50 mt-1 max-h-64 w-full overflow-auto rounded-lg border border-border bg-popover p-1 text-sm text-popover-foreground shadow-dropdown"
              >
                {loading ? (
                  <li className="px-2 py-4 text-center text-muted-foreground">Loading…</li>
                ) : suggestions.length === 0 ? (
                  <li className="px-2 py-4 text-center text-muted-foreground">{emptyText}</li>
                ) : (
                  suggestions.map((suggestion, index) => (
                    <li
                      key={suggestion.value}
                      id={`${listboxId}-${index}`}
                      role="option"
                      aria-selected={index === highlighted}
                      onMouseEnter={() => setHighlighted(index)}
                      onMouseDown={(event) => {
                        event.preventDefault();
                        pick(suggestion);
                      }}
                      className={cn(
                        "flex cursor-default flex-col rounded-md px-2 py-1.5",
                        index === highlighted && "bg-accent text-accent-foreground"
                      )}
                    >
                      <span>{suggestion.label}</span>
                      {suggestion.description ? (
                        <span className="text-xs text-muted-foreground">{suggestion.description}</span>
                      ) : null}
                    </li>
                  ))
                )}
              </motion.ul>
            ) : null}
          </AnimatePresence>
        </div>
      )}
    </FieldShell>
  );
}

export { AutocompleteField };
