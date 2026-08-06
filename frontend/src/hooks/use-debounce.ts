"use client";

import * as React from "react";

import { useDebouncedValue } from "@/components/data-display/shared/hooks";

/**
 * Debounce a rapidly changing value (search, filters).
 * Re-exports the shared data-display implementation for app-wide use.
 */
export function useDebounce<T>(value: T, delayMs = 300): T {
  return useDebouncedValue(value, delayMs);
}

/**
 * Debounced callback — useful for imperative handlers.
 */
export function useDebouncedCallback<TArgs extends unknown[]>(
  callback: (...args: TArgs) => void,
  delayMs = 300
) {
  const callbackRef = React.useRef(callback);
  callbackRef.current = callback;

  const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    },
    []
  );

  return React.useCallback(
    (...args: TArgs) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => callbackRef.current(...args), delayMs);
    },
    [delayMs]
  );
}
