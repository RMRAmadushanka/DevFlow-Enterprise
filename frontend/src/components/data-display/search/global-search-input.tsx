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
import {
  useControllableState,
  useDebouncedValue,
  useDisplayId,
} from "@/components/data-display/shared/hooks";
import type { GlobalSearchInputProps } from "./types";

const sizeClassName = {
  sm: "h-7",
  md: "h-8",
  lg: "h-9",
} as const;

/**
 * Debounced search box with clear, loading, and an optional focus shortcut.
 * Prefer this for toolbars and command surfaces; use the forms `SearchInput`
 * when the control lives inside a React Hook Form schema.
 */
function GlobalSearchInput({
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
  label = "Search",
  shortcut = "/",
  autoFocus,
}: GlobalSearchInputProps) {
  const controlId = useDisplayId(id);
  const [internalValue, setInternalValue] = useControllableState({
    value,
    defaultValue,
    onChange,
  });
  const debounced = useDebouncedValue(internalValue, debounceMs);
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  React.useEffect(() => {
    onSearch?.(debounced);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional: only fire on debounced change
  }, [debounced]);

  React.useEffect(() => {
    if (!shortcut) return;

    function handleKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      const isTyping =
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.isContentEditable;
      if (isTyping || event.metaKey || event.ctrlKey || event.altKey) return;

      if (event.key === shortcut) {
        event.preventDefault();
        inputRef.current?.focus();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [shortcut]);

  return (
    <InputGroup className={cn(sizeClassName[size], className)}>
      <InputGroupAddon>
        {loading ? (
          <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
        ) : (
          <Search className="size-3.5" aria-hidden="true" />
        )}
      </InputGroupAddon>
      <InputGroupInput
        ref={inputRef}
        id={controlId}
        type="search"
        role="searchbox"
        aria-label={label}
        aria-busy={loading || undefined}
        value={internalValue}
        onChange={(event) => setInternalValue(event.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        autoFocus={autoFocus}
      />
      {internalValue ? (
        <InputGroupAddon align="inline-end">
          <InputGroupButton
            type="button"
            size="icon-xs"
            aria-label="Clear search"
            onClick={() => setInternalValue("")}
          >
            <X className="size-3.5" />
          </InputGroupButton>
        </InputGroupAddon>
      ) : shortcut ? (
        <InputGroupAddon align="inline-end">
          <Kbd>{shortcut}</Kbd>
        </InputGroupAddon>
      ) : null}
    </InputGroup>
  );
}

export { GlobalSearchInput };
