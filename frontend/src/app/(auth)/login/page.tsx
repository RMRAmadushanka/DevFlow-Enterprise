"use client";

import * as React from "react";

import { KeycloakAuthRedirect } from "@/features/auth/components/keycloak-auth-redirect";

export default function LoginPage() {
  return (
    <React.Suspense fallback={<p className="p-6 text-sm text-muted-foreground">Loading…</p>}>
      <KeycloakAuthRedirect flow="login" />
    </React.Suspense>
  );
}
