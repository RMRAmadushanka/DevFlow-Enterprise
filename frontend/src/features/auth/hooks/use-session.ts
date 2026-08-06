"use client";

import { useQuery } from "@tanstack/react-query";
import * as React from "react";

import { authKeys } from "../constants/auth.constants";
import { authService } from "../services/auth.service";
import { useAuthStore } from "../store/auth.store";

/** Hydrates the auth store from the mock session on mount. */
export function useSessionBootstrap() {
  const setSession = useAuthStore((s) => s.setSession);

  const query = useQuery({
    queryKey: authKeys.session(),
    queryFn: () => authService.getSession(),
    staleTime: 30_000,
  });

  React.useEffect(() => {
    if (query.isSuccess) {
      setSession(query.data);
    }
  }, [query.isSuccess, query.data, setSession]);

  return query;
}

export function useAuthUser() {
  return useAuthStore((s) => s.user);
}

export function useIsAuthenticated() {
  return useAuthStore((s) => s.status === "authenticated");
}
