"use client";

/**
 * Unified auth API for UI — wraps Zustand + Keycloak JS without a second auth system.
 */

import { can } from "@/lib/permissions";
import type { Permission } from "@/lib/permissions";
import {
  getAccessToken,
  hasRealmRole,
  isKeycloakEnabled,
  refreshAccessToken,
} from "@/lib/auth/keycloak";
import { useKeycloakAuthInit } from "@/lib/auth/keycloak-auth-provider";

import { authService } from "../services/auth.service";
import { useAuthStore } from "../store/auth.store";
import type { AuthUserProfile, LoginPayload, RegisterPayload } from "../types/auth.types";
import { useLogout } from "./use-logout";

export function useAuth() {
  const user = useAuthStore((s) => s.user);
  const status = useAuthStore((s) => s.status);
  const permissions = useAuthStore((s) => s.permissions);
  const { initStatus, isKeycloak } = useKeycloakAuthInit();
  const { logout, isPending: logoutPending } = useLogout();

  const isLoading =
    initStatus === "initializing" || status === "unknown" || logoutPending;
  const isAuthenticated = status === "authenticated" && Boolean(user);
  const token = getAccessToken();

  return {
    isAuthenticated,
    isLoading,
    user: user as AuthUserProfile | null,
    token,
    status,
    initStatus,
    isKeycloak,
    oidcEnabled: isKeycloakEnabled(),
    login: (payload?: LoginPayload) =>
      authService.login(
        payload ?? { email: "", password: "" }
      ),
    register: (payload?: RegisterPayload) =>
      authService.register(
        payload ?? {
          firstName: "",
          lastName: "",
          email: "",
          password: "",
          acceptTerms: true,
        }
      ),
    logout,
    refreshToken: () => refreshAccessToken(30),
    hasRole: (role: string) => {
      if (isKeycloakEnabled()) return hasRealmRole(role);
      return user?.role?.toLowerCase() === role.toLowerCase();
    },
    hasPermission: (permission: Permission | string) =>
      can(permissions, permission as Permission),
    getToken: () => getAccessToken(),
  };
}
