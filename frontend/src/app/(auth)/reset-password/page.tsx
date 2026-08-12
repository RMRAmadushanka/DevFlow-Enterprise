"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import * as React from "react";

import { AuthLayout, ResetPasswordForm } from "@/features/auth";
import { AlertBanner } from "@/components/feedback/alert";
import { Button } from "@/components/ui/button";
import { routes } from "@/config/routes";
import { beginPasswordResetRedirect, isKeycloakEnabled } from "@/lib/auth/keycloak";

function ResetPasswordContent() {
  const params = useSearchParams();
  const token = params.get("token") ?? "";
  const oidcEnabled = isKeycloakEnabled();
  const [pending, setPending] = React.useState(false);

  if (oidcEnabled) {
    return (
      <AuthLayout
        title="Reset password"
        description="Password reset is managed securely by Keycloak"
        footer={
          <Link href={routes.auth.login} className="font-medium text-primary hover:underline">
            Back to sign in
          </Link>
        }
      >
        <div className="flex flex-col gap-4">
          <AlertBanner
            tone="info"
            title="Continue in Keycloak"
            description="DevFlow does not reset passwords in the User Service."
          />
          <Button
            type="button"
            disabled={pending}
            onClick={() => {
              setPending(true);
              void beginPasswordResetRedirect().catch(() => setPending(false));
            }}
          >
            {pending ? "Redirecting…" : "Continue to Keycloak"}
          </Button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Choose a new password"
      description="Use a strong password you haven't used elsewhere"
      footer={
        <Link href={routes.auth.login} className="font-medium text-primary hover:underline">
          Back to sign in
        </Link>
      }
    >
      {token ? (
        <ResetPasswordForm token={token} />
      ) : (
        <AlertBanner
          tone="error"
          title="Missing reset token"
          description="Open the link from your email, or request a new reset."
        />
      )}
    </AuthLayout>
  );
}

export default function ResetPasswordPage() {
  return (
    <React.Suspense fallback={null}>
      <ResetPasswordContent />
    </React.Suspense>
  );
}
