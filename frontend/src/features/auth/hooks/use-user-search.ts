"use client";

import { useQuery } from "@tanstack/react-query";
import * as React from "react";

import { authKeys } from "../constants/auth.constants";
import { isUserApiEnabled, userApiService } from "../services/user-api.service";
import type { UserSearchResult } from "../services/user-api.mappers";

export function useUserSearch(params: {
  q: string;
  organizationId?: string | null;
  enabled?: boolean;
  debounceMs?: number;
}) {
  const [debouncedQ, setDebouncedQ] = React.useState(params.q);
  const debounceMs = params.debounceMs ?? 300;

  React.useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedQ(params.q), debounceMs);
    return () => window.clearTimeout(timer);
  }, [params.q, debounceMs]);

  return useQuery({
    queryKey: [
      ...authKeys.all,
      "user-search",
      debouncedQ,
      params.organizationId ?? null,
    ],
    queryFn: async (): Promise<UserSearchResult[]> => {
      if (!isUserApiEnabled()) {
        return [];
      }
      return userApiService.searchUsers({
        q: debouncedQ,
        organizationId: params.organizationId,
      });
    },
    enabled:
      (params.enabled ?? true) &&
      debouncedQ.trim().length >= 1 &&
      isUserApiEnabled(),
    staleTime: 15_000,
  });
}
