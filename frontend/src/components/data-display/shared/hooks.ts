"use client";

import * as React from "react";

/**
 * Controlled/uncontrolled value pattern shared across the data display
 * system (selection, sort, filters, density…) — mirrors the form system's
 * `useControllableState` so both component families behave identically.
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

/** Debounces a fast-changing value — used by `GlobalSearchInput` and table toolbar search. */
export function useDebouncedValue<T>(value: T, delayMs = 300): T {
  const [debounced, setDebounced] = React.useState(value);

  React.useEffect(() => {
    const timeout = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timeout);
  }, [value, delayMs]);

  return debounced;
}

/** True once mounted on the client — guards APIs that don't exist during SSR (matchMedia, ResizeObserver). */
export function useIsClient() {
  const [isClient, setIsClient] = React.useState(false);
  React.useEffect(() => setIsClient(true), []);
  return isClient;
}

/**
 * Live `matchMedia` boolean, SSR-safe (`false` until mounted). Backs the
 * table→card responsive collapse and any other breakpoint-driven behavior
 * that CSS alone can't express (e.g. choosing which component to render).
 */
export function useMediaQuery(query: string): boolean {
  const isClient = useIsClient();
  const [matches, setMatches] = React.useState(false);

  React.useEffect(() => {
    if (!isClient) return;
    const mql = window.matchMedia(query);
    setMatches(mql.matches);
    const listener = (event: MediaQueryListEvent) => setMatches(event.matches);
    mql.addEventListener("change", listener);
    return () => mql.removeEventListener("change", listener);
  }, [isClient, query]);

  return isClient && matches;
}

/** Convenience wrapper around `useMediaQuery` for the system's `md` breakpoint — the usual table→card cutover. */
export function useIsMobile() {
  return useMediaQuery("(max-width: 767px)");
}

/** Stable auto-generated id, falling back to a caller-provided one. */
export function useDisplayId(id?: string) {
  const generated = React.useId();
  return id ?? generated;
}
