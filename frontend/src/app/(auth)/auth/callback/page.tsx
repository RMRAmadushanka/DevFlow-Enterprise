"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { AlertBanner } from "@/components/feedback/alert";
import { routes } from "@/config/routes";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { AuthProgress } from "@/features/auth/components/auth-progress";
import { oidcAuthService } from "@/features/auth/services/oidc-auth.service";
import { toAuthErrorMessage } from "@/features/auth/utils/errors";
import { AuthLoading, useKeycloakAuthInit } from "@/lib/auth/keycloak-auth-provider";
import { consumePostLoginNext, isAuthenticated } from "@/lib/auth/keycloak";
import { safeInternalPath } from "@/lib/navigation/safe-internal-path";

function AuthCallbackContent() {
  const router = useRouter();
  const params = useSearchParams();
  const setSession = useAuthStore((s) => s.setSession);
  const { initStatus } = useKeycloakAuthInit();
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (initStatus === "initializing") return;

    let cancelled = false;

    async function complete() {
      const oauthError = params.get("error");
      if (oauthError) {
        setError(params.get("error_description") || oauthError);
        return;
      }

      if (initStatus === "error") {
        setError("Unable to initialize authentication. Please try again.");
        return;
      }

      if (!isAuthenticated()) {
        setError("Missing or incomplete authentication response. Please sign in again.");
        return;
      }

      try {
        // KeycloakAuthProvider already hydrates the profile once during init.
        // Reuse that session when present so we do not call /me again.
        const existing = useAuthStore.getState();
        if (existing.status === "authenticated" && existing.user) {
          if (cancelled) return;
          const target = safeInternalPath(consumePostLoginNext(), routes.app.dashboard);
          router.replace(target);
          return;
        }

        const { session, next } = await oidcAuthService.completeLoginFromCallback();
        if (cancelled) return;
        setSession(session);
        const target = safeInternalPath(next, routes.app.dashboard);
        router.replace(target);
      } catch (err) {
        if (!cancelled) {
          setError(toAuthErrorMessage(err));
        }
      }
    }

    void complete();
    return () => {
      cancelled = true;
    };
  }, [initStatus, params, router, setSession]);

  if (error) {
    return (
      <div className="mx-auto flex max-w-md flex-col gap-4 p-8">
        <AlertBanner tone="error" title="Sign-in failed" description={error} />
        <a href={routes.auth.login} className="text-sm font-medium text-primary hover:underline">
          Back to login
        </a>
      </div>
    );
  }

  return <AuthLoading label="Signing in" />;
}

/**
 * OIDC redirect URI — Keycloak JS processes the authorization code during init;
 * this page hydrates the app profile and redirects into the product.
 */
export default function AuthCallbackPage() {
  return (
    <React.Suspense fallback={<AuthProgress label="Signing in" />}>
      <AuthCallbackContent />
    </React.Suspense>
  );
}
