"use client";

import { useQuery } from "@tanstack/react-query";
import * as React from "react";

import { isKeycloakEnabled } from "@/lib/auth/keycloak";

import { authKeys } from "../constants/auth.constants";
import { authService } from "../services/auth.service";
import { useAuthStore } from "../store/auth.store";

/**
 * Hydrates the auth store from mock session on mount.
 * When Keycloak is enabled, KeycloakAuthProvider owns hydration — this hook
 * only mirrors store readiness so we do not re-call /api/auth/me + /api/users/me.
 */
export function useSessionBootstrap() {
  const setSession = useAuthStore((s) => s.setSession);
  const status = useAuthStore((s) => s.status);
  const keycloak = isKeycloakEnabled();

  const query = useQuery({
    queryKey: authKeys.session(),
    queryFn: () => authService.getSession(),
    staleTime: 60_000,
    enabled: !keycloak,
  });

  React.useEffect(() => {
    if (keycloak) return;
    if (!query.isSuccess) return;
    setSession(query.data);
  }, [keycloak, query.isSuccess, query.data, setSession]);

  if (keycloak) {
    const ready = status !== "unknown";
    return {
      ...query,
      isLoading: !ready,
      isFetched: ready,
      isSuccess: ready,
      data: undefined,
    };
  }

  return query;
}

export function useAuthUser() {
  return useAuthStore((s) => s.user);
}

export function useIsAuthenticated() {
  return useAuthStore((s) => s.status === "authenticated");
}
