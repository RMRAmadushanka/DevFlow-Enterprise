"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type UrlStateValue = string | number | boolean | null | undefined;

export type UrlStateMap = Record<string, UrlStateValue>;

export interface UseUrlStateOptions<T extends UrlStateMap> {
  /** Defaults applied when a key is missing from the URL. */
  defaults?: Partial<T>;
  /** Replace history entry instead of push. @default true */
  replace?: boolean;
}

function serialize(value: UrlStateValue): string | null {
  if (value === undefined || value === null || value === "") return null;
  if (typeof value === "boolean") return value ? "1" : "0";
  return String(value);
}

function parseValue(raw: string | null, fallback: UrlStateValue): UrlStateValue {
  if (raw === null) return fallback;
  if (typeof fallback === "number") {
    const n = Number(raw);
    return Number.isFinite(n) ? n : fallback;
  }
  if (typeof fallback === "boolean") {
    return raw === "1" || raw === "true";
  }
  return raw;
}

/**
 * Sync a small bag of list-page state with the URL query string.
 *
 * Example: `/projects?page=2&status=active&q=api`
 */
export function useUrlState<T extends UrlStateMap>(options: UseUrlStateOptions<T> = {}) {
  const { defaults = {} as Partial<T>, replace = true } = options;
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const state = React.useMemo(() => {
    const next = { ...defaults } as T;
    for (const key of Object.keys(defaults) as (keyof T)[]) {
      const fallback = defaults[key];
      next[key] = parseValue(searchParams.get(String(key)), fallback) as T[keyof T];
    }
    // Also surface any extra keys present in the URL that aren't in defaults.
    searchParams.forEach((value, key) => {
      if (!(key in next)) {
        (next as UrlStateMap)[key] = value;
      }
    });
    return next;
  }, [defaults, searchParams]);

  const setState = React.useCallback(
    (patch: Partial<T> | ((prev: T) => Partial<T>)) => {
      const resolved = typeof patch === "function" ? patch(state) : patch;
      const params = new URLSearchParams(searchParams.toString());

      for (const [key, value] of Object.entries(resolved)) {
        const serialized = serialize(value as UrlStateValue);
        const defaultSerialized = serialize((defaults as UrlStateMap)[key]);
        if (serialized === null || serialized === defaultSerialized) {
          params.delete(key);
        } else {
          params.set(key, serialized);
        }
      }

      const qs = params.toString();
      const href = qs ? `${pathname}?${qs}` : pathname;
      if (replace) router.replace(href, { scroll: false });
      else router.push(href, { scroll: false });
    },
    [defaults, pathname, replace, router, searchParams, state]
  );

  const setKey = React.useCallback(
    <K extends keyof T>(key: K, value: T[K]) => {
      setState({ [key]: value } as unknown as Partial<T>);
    },
    [setState]
  );

  const reset = React.useCallback(() => {
    setState(defaults as Partial<T>);
  }, [defaults, setState]);

  return { state, setState, setKey, reset, searchParams };
}
