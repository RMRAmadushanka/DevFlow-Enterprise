"use client";

/**
 * @deprecated Use KeycloakAuthProvider from `@/lib/auth/keycloak-auth-provider`.
 */
export {
  KeycloakAuthProvider as AuthSessionBridge,
  AuthLoading,
  useKeycloakAuthInit,
} from "./keycloak-auth-provider";
