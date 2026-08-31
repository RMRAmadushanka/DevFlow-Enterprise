"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

import { AlertBanner } from "@/components/feedback/alert";
import { routes } from "@/config/routes";
import {
  beginLoginRedirect,
  beginPasswordResetRedirect,
  beginRegisterRedirect,
  ensureKeycloakReady,
  isAuthenticated,
  isKeycloakEnabled,
} from "@/lib/auth/keycloak";
import { safeInternalPath } from "@/lib/navigation/safe-internal-path";

import { AuthLayout } from "./auth-layout";

export type KeycloakAuthFlow = "login" | "register" | "reset";

const COPY: Record<KeycloakAuthFlow, { title: string; description: string }> = {
  login: {
    title: "Welcome back",
    description: "Sign in to DevFlow Enterprise",
  },
  register: {
    title: "Create your account",
    description: "Start collaborating with your engineering team",
  },
  reset: {
    title: "Forgot password",
    description: "Password reset continues in Keycloak",
  },
};

/**
 * Launches the Keycloak hosted UI. Does not collect credentials.
 */
function KeycloakAuthRedirect({ flow }: { flow: KeycloakAuthFlow }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = safeInternalPath(searchParams.get("next"), routes.app.dashboard);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!isKeycloakEnabled()) {
      setError(
        "Identity provider is not configured. Set NEXT_PUBLIC_KEYCLOAK_URL to enable sign-in."
      );
      return;
    }

    let cancelled = false;
    const run = async () => {
      try {
        await ensureKeycloakReady();
        if (cancelled) return;
        if (flow !== "reset" && isAuthenticated()) {
          router.replace(next);
          return;
        }
        if (flow === "register") {
          await beginRegisterRedirect({ next });
        } else if (flow === "reset") {
          await beginPasswordResetRedirect();
        } else {
          await beginLoginRedirect({ next });
        }
      } catch (cause) {
        const message = cause instanceof Error ? cause.message : "Unable to start sign-in";
        if (cancelled || message.toLowerCase().includes("redirecting")) {
          return;
        }
        setError(message);
      }
    };
    void run();
    return () => {
      cancelled = true;
    };
  }, [flow, next, router]);

  const copy = COPY[flow];

  return (
    <AuthLayout title={copy.title} description={copy.description}>
      {error ? (
        <AlertBanner tone="error" title="Sign-in unavailable" description={error} />
      ) : (
        <div className="flex justify-center py-2" role="status" aria-live="polite" aria-busy="true">
          <Loader2 className="size-5 animate-spin text-muted-foreground" aria-hidden="true" />
          <span className="sr-only">Redirecting</span>
        </div>
      )}
    </AuthLayout>
  );
}

export { KeycloakAuthRedirect };
