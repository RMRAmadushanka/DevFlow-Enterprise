/**
 * In-memory token accessors via the Keycloak JS adapter.
 * Do not persist access/refresh/id tokens to Web Storage.
 */

import { getKeycloak, initKeycloak } from "./instance";
import { isKeycloakEnabled } from "./config";

export interface AccessTokenResult {
  accessToken: string;
}

export function getAccessToken(): string | null {
  if (!isKeycloakEnabled() || typeof window === "undefined") return null;
  try {
    return getKeycloak().token ?? null;
  } catch {
    return null;
  }
}

export function getIdToken(): string | null {
  if (!isKeycloakEnabled() || typeof window === "undefined") return null;
  try {
    return getKeycloak().idToken ?? null;
  } catch {
    return null;
  }
}

export function isAuthenticated(): boolean {
  if (!isKeycloakEnabled() || typeof window === "undefined") return false;
  try {
    return Boolean(getKeycloak().authenticated && getKeycloak().token);
  } catch {
    return false;
  }
}

let refreshInFlight: Promise<AccessTokenResult | null> | null = null;

/**
 * Refresh access token when it expires within `minValidity` seconds.
 * Single-flight to avoid parallel refresh storms.
 */
export async function refreshAccessToken(minValidity = 30): Promise<AccessTokenResult | null> {
  if (!isKeycloakEnabled() || typeof window === "undefined") return null;
  if (refreshInFlight) return refreshInFlight;

  refreshInFlight = (async () => {
    try {
      await initKeycloak();
      const kc = getKeycloak();
      if (!kc.authenticated) return null;
      await kc.updateToken(minValidity);
      return kc.token ? { accessToken: kc.token } : null;
    } catch {
      // Refresh failed (expired/revoked) — drop local tokens so 401 handling can redirect.
      try {
        getKeycloak().clearToken();
      } catch {
        // ignore
      }
      return null;
    } finally {
      refreshInFlight = null;
    }
  })();

  return refreshInFlight;
}

/** Clear adapter tokens in memory (logout / 401). */
export function clearKeycloakTokens(): void {
  if (!isKeycloakEnabled() || typeof window === "undefined") return;
  try {
    const kc = getKeycloak();
    kc.clearToken();
  } catch {
    // ignore
  }
}

export function hasRealmRole(role: string): boolean {
  if (!isAuthenticated()) return false;
  try {
    return getKeycloak().hasRealmRole(role);
  } catch {
    return false;
  }
}

export function hasResourceRole(role: string, resource?: string): boolean {
  if (!isAuthenticated()) return false;
  try {
    return getKeycloak().hasResourceRole(role, resource);
  } catch {
    return false;
  }
}
