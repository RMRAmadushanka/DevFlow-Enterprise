/**
 * TanStack Query defaults shared across features.
 * Per-feature overrides live in feature hooks, not here.
 */

export const queryConfig = {
  staleTimeMs: 60_000,
  gcTimeMs: 5 * 60_000,
  retry: 1,
  refetchOnWindowFocus: false,
} as const;
