import { apiClient } from "../client";
import type { AuthHealth, AuthStatus, CurrentUser, LogoutResponse } from "../types/auth";

/** Typed Gateway client for auth-service (`/api/auth`). Login/tokens remain Keycloak. */
export const authApi = {
  health(): Promise<AuthHealth> {
    return apiClient<AuthHealth>("/api/auth/health", { skipAuthHandler: true });
  },

  status(): Promise<AuthStatus> {
    return apiClient<AuthStatus>("/api/auth/status", { skipAuthHandler: true });
  },

  me(): Promise<CurrentUser> {
    return apiClient<CurrentUser>("/api/auth/me");
  },

  logout(options?: { idTokenHint?: string }): Promise<LogoutResponse> {
    return apiClient<LogoutResponse>("/api/auth/logout", {
      method: "POST",
      query: options?.idTokenHint ? { idTokenHint: options.idTokenHint } : undefined,
      headers: options?.idTokenHint
        ? { "X-Id-Token": options.idTokenHint }
        : undefined,
    });
  },

  adminPing(): Promise<{ scope: string; ok: string }> {
    return apiClient<{ scope: string; ok: string }>("/api/auth/admin/ping");
  },
};
