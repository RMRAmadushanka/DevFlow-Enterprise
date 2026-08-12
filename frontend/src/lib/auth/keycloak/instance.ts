/**
 * Singleton Keycloak JS adapter — browser only.
 * Tokens stay in the adapter's in-memory state (never localStorage/sessionStorage).
 */

import Keycloak from "keycloak-js";

import { getKeycloakConfig, isKeycloakEnabled } from "./config";

let keycloak: Keycloak | null = null;
let initPromise: Promise<boolean> | null = null;

export function getKeycloak(): Keycloak {
  if (typeof window === "undefined") {
    throw new Error("Keycloak JS must only run in the browser");
  }
  if (!isKeycloakEnabled()) {
    throw new Error("Keycloak is not configured (NEXT_PUBLIC_KEYCLOAK_URL)");
  }
  if (!keycloak) {
    const config = getKeycloakConfig();
    keycloak = new Keycloak({
      url: config.url,
      realm: config.realm,
      clientId: config.clientId,
    });
  }
  return keycloak;
}

/**
 * Initialize Keycloak once per page load.
 * Uses Authorization Code + PKCE S256 (adapter default) and check-sso.
 */
export function initKeycloak(): Promise<boolean> {
  if (typeof window === "undefined") {
    return Promise.resolve(false);
  }
  if (!isKeycloakEnabled()) {
    return Promise.resolve(false);
  }
  if (initPromise) return initPromise;

  const config = getKeycloakConfig();
  const kc = getKeycloak();

  initPromise = kc
    .init({
      onLoad: "check-sso",
      pkceMethod: "S256",
      checkLoginIframe: false,
      silentCheckSsoRedirectUri: config.silentCheckSsoRedirectUri,
      redirectUri: config.redirectUri,
    })
    .catch((error: unknown) => {
      initPromise = null;
      console.error("[auth] Keycloak init failed", error);
      return false;
    });

  return initPromise;
}

/** Reset singleton — tests only. */
export function resetKeycloakForTests(): void {
  keycloak = null;
  initPromise = null;
}
