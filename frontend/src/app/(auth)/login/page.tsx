"use client";

import * as React from "react";

import { AuthProgress } from "@/features/auth/components/auth-progress";
import { KeycloakAuthRedirect } from "@/features/auth/components/keycloak-auth-redirect";

export default function LoginPage() {
  return (
    <React.Suspense fallback={<AuthProgress label="Loading" />}>
      <KeycloakAuthRedirect flow="login" />
    </React.Suspense>
  );
}
