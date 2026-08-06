"use client";

import * as React from "react";

/**
 * Controlled/uncontrolled value pattern shared by every field that needs to
 * work both standalone (`defaultValue`) and wired to React Hook Form
 * (`value` + `onChange`) — mirrors the pattern used by Base UI/Radix
 * primitives so field components feel native next to `Select`, `Switch`, etc.
 */
export function useControllableState<T>({
  value,
  defaultValue,
  onChange,
}: {
  value?: T;
  defaultValue: T;
  onChange?: (value: T) => void;
}): [T, (next: T | ((prev: T) => T)) => void] {
  const [uncontrolled, setUncontrolled] = React.useState(defaultValue);
  const isControlled = value !== undefined;
  const current = isControlled ? (value as T) : uncontrolled;
  const currentRef = React.useRef(current);
  currentRef.current = current;

  const setValue = React.useCallback(
    (next: T | ((prev: T) => T)) => {
      const resolved = typeof next === "function" ? (next as (prev: T) => T)(currentRef.current) : next;
      if (!isControlled) setUncontrolled(resolved);
      onChange?.(resolved);
    },
    [isControlled, onChange]
  );

  return [current, setValue];
}

/** Debounces a fast-changing value — used by search/autocomplete/async validation. */
export function useDebouncedValue<T>(value: T, delayMs = 300): T {
  const [debounced, setDebounced] = React.useState(value);

  React.useEffect(() => {
    const timeout = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timeout);
  }, [value, delayMs]);

  return debounced;
}

/** Stable auto-generated id, falling back to a caller-provided one. */
export function useFieldId(id?: string) {
  const generated = React.useId();
  return id ?? generated;
}

/** Copies text to the clipboard, reporting a transient "copied" state for UI feedback. */
export function useClipboard(resetAfterMs = 1500) {
  const [copied, setCopied] = React.useState(false);
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const copy = React.useCallback(
    async (text: string) => {
      try {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => setCopied(false), resetAfterMs);
        return true;
      } catch {
        return false;
      }
    },
    [resetAfterMs]
  );

  React.useEffect(() => () => clearTimeout(timeoutRef.current), []);

  return { copied, copy };
}

/** True once mounted on the client — guards APIs that don't exist during SSR (clipboard, matchMedia). */
export function useIsClient() {
  const [isClient, setIsClient] = React.useState(false);
  React.useEffect(() => setIsClient(true), []);
  return isClient;
}
