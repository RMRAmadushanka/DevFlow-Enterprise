/**
 * Public Keycloak / OIDC configuration for the SPA.
 * Never put client secrets, admin credentials, or private keys in NEXT_PUBLIC_*.
 */

export interface KeycloakPublicConfig {
  url: string;
  realm: string;
  clientId: string;
  redirectUri: string;
  postLogoutRedirectUri: string;
  silentCheckSsoRedirectUri: string;
  scopes: string;
}

/** True when the SPA should use Keycloak (public client). */
export function isKeycloakEnabled(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_KEYCLOAK_URL?.trim());
}

/** @deprecated Prefer {@link isKeycloakEnabled} — kept for existing imports. */
export function isOidcEnabled(): boolean {
  return isKeycloakEnabled();
}

export function getKeycloakConfig(): KeycloakPublicConfig {
  const url = (process.env.NEXT_PUBLIC_KEYCLOAK_URL ?? "").replace(/\/$/, "");
  const realm = process.env.NEXT_PUBLIC_KEYCLOAK_REALM?.trim() || "devflow";
  const clientId = process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID?.trim() || "devflow-web";
  const appOrigin =
    typeof window !== "undefined"
      ? window.location.origin
      : process.env.NEXT_PUBLIC_APP_URL?.trim() || "http://localhost:3000";

  return {
    url,
    realm,
    clientId,
    redirectUri: `${appOrigin}/auth/callback`,
    postLogoutRedirectUri: `${appOrigin}/login`,
    silentCheckSsoRedirectUri: `${appOrigin}/silent-check-sso.html`,
    scopes: "openid profile email",
  };
}

/** Presence cookie for Next.js middleware (not a credential). */
export const AUTH_MARKER_COOKIE = "devflow.auth";
