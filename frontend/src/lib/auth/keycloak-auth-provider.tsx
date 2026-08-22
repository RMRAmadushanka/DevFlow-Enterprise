"use client";

import * as React from "react";

import { PageSkeleton } from "@/components/architecture/loading";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { setUnauthorizedHandler } from "@/lib/api";
import {
  buildSessionIfAuthenticated,
  clearAuthMarkerCookie,
  isAuthenticated,
  isKeycloakEnabled,
  isLogoutInProgress,
  toLibAuthSession,
} from "@/lib/auth/keycloak";
import { registerClientSessionProvider } from "@/lib/auth/session";

export type AuthInitStatus = "initializing" | "ready" | "error";

interface KeycloakAuthContextValue {
  initStatus: AuthInitStatus;
  isKeycloak: boolean;
}

const KeycloakAuthContext = React.createContext<KeycloakAuthContextValue>({
  initStatus: "ready",
  isKeycloak: false,
});

export function useKeycloakAuthInit(): KeycloakAuthContextValue {
  return React.useContext(KeycloakAuthContext);
}

/**
 * Initializes Keycloak JS once (check-sso + PKCE S256).
 * Mock mode (no Keycloak URL) skips adapter init.
 * Must only run in client components — never from Server Components.
 */
export function KeycloakAuthProvider({ children }: { children: React.ReactNode }) {
  const setSession = useAuthStore((s) => s.setSession);
  const [initStatus, setInitStatus] = React.useState<AuthInitStatus>(() =>
    isKeycloakEnabled() ? "initializing" : "ready"
  );

  React.useEffect(() => {
    registerClientSessionProvider(() => {
      const fromStore = useAuthStore.getState();
      if (fromStore.status === "authenticated" && fromStore.user) {
        return toLibAuthSession({
          user: fromStore.user,
          organizationId: fromStore.organizationId ?? "",
          permissions: fromStore.permissions,
          sessionId: fromStore.sessionId ?? `sess_${fromStore.user.id}`,
        });
      }
      return null;
    });

    setUnauthorizedHandler(() => {
      if (isLogoutInProgress()) return;
      // API 401 must not destroy a live Keycloak adapter session.
      // Doing so sent /login back into keycloak.login() and looped
      // callback → dashboard → login.
      if (isKeycloakEnabled() && isAuthenticated()) {
        return;
      }

      // Mark signing-out first so the shell shows loading instead of
      // "Sign in required", then hard-navigate — do not clear the user store
      // before unload (that paint is the flash on token expiry).
      useAuthStore.getState().beginSignOut();
      clearAuthMarkerCookie();
      if (typeof window !== "undefined") {
        const path = window.location.pathname;
        if (path.startsWith("/login") || path.startsWith("/auth/")) {
          return;
        }
        const next = `${path}${window.location.search}`;
        const params = new URLSearchParams();
        if (next && !next.startsWith("/login") && !next.startsWith("/auth/")) {
          params.set("next", next);
        }
        const qs = params.toString();
        window.location.replace(qs ? `/login?${qs}` : "/login");
      }
    });

    return () => {
      registerClientSessionProvider(null);
      setUnauthorizedHandler(null);
    };
  }, []);

  React.useEffect(() => {
    if (!isKeycloakEnabled()) {
      setInitStatus("ready");
      return;
    }

    let cancelled = false;

    void (async () => {
      try {
        const session = await buildSessionIfAuthenticated();
        if (cancelled) return;
        if (session) {
          setSession(session);
        } else if (useAuthStore.getState().status === "unknown") {
          setSession(null);
        }
        setInitStatus("ready");
      } catch (error) {
        console.error("[auth] Keycloak bootstrap failed", error);
        if (!cancelled) {
          setSession(null);
          setInitStatus("error");
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [setSession]);

  React.useEffect(() => {
    if (process.env.NODE_ENV === "development" && isKeycloakEnabled()) {
      console.info("[auth] Keycloak JS enabled (in-memory tokens)");
    }
  }, []);

  const value = React.useMemo(
    () => ({
      initStatus,
      isKeycloak: isKeycloakEnabled(),
    }),
    [initStatus]
  );

  if (initStatus === "initializing") {
    return (
      <KeycloakAuthContext.Provider value={value}>
        <AuthLoading />
      </KeycloakAuthContext.Provider>
    );
  }

  return (
    <KeycloakAuthContext.Provider value={value}>{children}</KeycloakAuthContext.Provider>
  );
}

/** Reusable auth bootstrap loading UI — avoids flashing protected content. */
export function AuthLoading() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center p-6" role="status" aria-live="polite">
      <PageSkeleton variant="form" />
    </div>
  );
}
