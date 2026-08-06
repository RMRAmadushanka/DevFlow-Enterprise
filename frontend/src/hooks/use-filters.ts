"use client";

import * as React from "react";

export type FilterMap = Record<string, string | string[] | null | undefined>;

export interface UseFiltersOptions<T extends FilterMap> {
  initial?: T;
  value?: T;
  onChange?: (next: T) => void;
}

/**
 * Generic filter bag for list toolbars.
 * Prefer URL-backed filters via `useUrlState` for shareable list views.
 */
export function useFilters<T extends FilterMap>({
  initial,
  value: controlled,
  onChange,
}: UseFiltersOptions<T> = {}) {
  const [uncontrolled, setUncontrolled] = React.useState<T>((initial ?? {}) as T);
  const filters = controlled ?? uncontrolled;

  const setFilters = React.useCallback(
    (next: T | ((prev: T) => T)) => {
      const resolved = typeof next === "function" ? (next as (prev: T) => T)(filters) : next;
      if (controlled === undefined) setUncontrolled(resolved);
      onChange?.(resolved);
    },
    [controlled, filters, onChange]
  );

  const setFilter = React.useCallback(
    <K extends keyof T>(key: K, value: T[K]) => {
      setFilters({ ...filters, [key]: value });
    },
    [filters, setFilters]
  );

  const clearFilters = React.useCallback(() => {
    setFilters((initial ?? {}) as T);
  }, [initial, setFilters]);

  const activeCount = Object.values(filters).filter((v) => {
    if (v == null || v === "") return false;
    if (Array.isArray(v)) return v.length > 0;
    return true;
  }).length;

  return {
    filters,
    setFilters,
    setFilter,
    clearFilters,
    activeCount,
    hasActiveFilters: activeCount > 0,
  };
}
