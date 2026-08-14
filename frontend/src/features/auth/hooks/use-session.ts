"use client";

import { useQuery } from "@tanstack/react-query";
import * as React from "react";

import { isAuthenticated, isKeycloakEnabled } from "@/lib/auth/keycloak";

import { authKeys } from "../constants/auth.constants";
import { authService } from "../services/auth.service";
import { useAuthStore } from "../store/auth.store";

/** Hydrates the auth store from Keycloak / mock session on mount. */
export function useSessionBootstrap() {
  const setSession = useAuthStore((s) => s.setSession);

  const query = useQuery({
    queryKey: authKeys.session(),
    queryFn: () => authService.getSession(),
    staleTime: 30_000,
  });

  React.useEffect(() => {
    if (!query.isSuccess) return;
    if (query.data) {
      setSession(query.data);
      return;
    }
    // A null session must not wipe a live Keycloak adapter session.
    if (isKeycloakEnabled() && isAuthenticated()) {
      return;
    }
    setSession(null);
  }, [query.isSuccess, query.data, setSession]);

  return query;
}

export function useAuthUser() {
  return useAuthStore((s) => s.user);
}

export function useIsAuthenticated() {
  return useAuthStore((s) => s.status === "authenticated");
}
