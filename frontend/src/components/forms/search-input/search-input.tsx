"use client";

import * as React from "react";
import { Loader2, Search, X } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Kbd } from "@/components/forms/search-input/kbd";
import { useControllableState, useDebouncedValue, useFieldId } from "@/components/forms/shared/hooks";
import { fieldControlSizeClassName, fieldIconSizeClassName } from "@/components/forms/shared/size";
import type { SearchInputProps } from "./types";

/** A search box with a leading icon, clear button, loading state, and an optional focus shortcut (defaults to `/`). */
function SearchInput({
  value,
  defaultValue = "",
  onChange,
  onSearch,
  debounceMs = 300,
  placeholder = "Search…",
  disabled,
  loading,
  size = "md",
  className,
  id,
  name,
  label = "Search",
  shortcut = "/",
  autoFocus,
  inputRef,
}: SearchInputProps) {
  const controlId = useFieldId(id);
  const [internalValue, setInternalValue] = useControllableState({ value, defaultValue, onChange });
  const debounced = useDebouncedValue(internalValue, debounceMs);
  const localRef = React.useRef<HTMLInputElement | null>(null);

  React.useEffect(() => {
    onSearch?.(debounced);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced]);

  React.useEffect(() => {
    if (!shortcut) return;

    function handleKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      const isTyping =
        target?.tagName === "INPUT" || target?.tagName === "TEXTAREA" || target?.isContentEditable;
      if (isTyping || event.metaKey || event.ctrlKey || event.altKey) return;

      if (event.key === shortcut) {
        event.preventDefault();
        localRef.current?.focus();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [shortcut]);

  return (
    <InputGroup className={cn(fieldControlSizeClassName[size], className)}>
      <InputGroupAddon>
        <Search className={fieldIconSizeClassName[size]} aria-hidden="true" />
      </InputGroupAddon>
      <InputGroupInput
        id={controlId}
        name={name}
        type="search"
        role="searchbox"
        aria-label={label}
        value={internalValue}
        onChange={(event) => setInternalValue(event.target.value)}
        placeholder={placeholder}
        disabled={disabled || loading}
        autoFocus={autoFocus}
        ref={(node) => {
          localRef.current = node;
          if (typeof inputRef === "function") inputRef(node);
          else if (inputRef) (inputRef as React.MutableRefObject<HTMLInputElement | null>).current = node;
        }}
      />
      <InputGroupAddon align="inline-end">
        {loading ? (
          <Loader2 className={cn(fieldIconSizeClassName[size], "animate-spin")} aria-hidden="true" />
        ) : internalValue ? (
          <InputGroupButton aria-label="Clear search" size="icon-xs" onClick={() => setInternalValue("")}>
            <X />
          </InputGroupButton>
        ) : shortcut ? (
          <Kbd>{shortcut}</Kbd>
        ) : null}
      </InputGroupAddon>
    </InputGroup>
  );
}

export { SearchInput };
