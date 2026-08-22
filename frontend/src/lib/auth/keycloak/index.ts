import { AuthenticationError } from "@/features/auth/utils/errors";
import type { AuthSessionInfo } from "@/features/auth/types/auth.types";

import { clearAuthMarkerCookie, setAuthMarkerCookie } from "./auth-marker";
import { getKeycloakConfig, isKeycloakEnabled } from "./config";
import { getKeycloak, initKeycloak } from "./instance";
import { consumePostLoginNext, persistPostLoginNext } from "./redirect-state";
import {
  fetchCurrentUserBundle,
  toAuthSessionInfo,
} from "./session-builder";
import {
  clearKeycloakTokens,
  getAccessToken,
  isAuthenticated,
  refreshAccessToken,
} from "./tokens";

export { isKeycloakEnabled, isOidcEnabled } from "./config";
export {
  getAccessToken,
  getIdToken,
  refreshAccessToken,
  clearKeycloakTokens,
  isAuthenticated,
  hasRealmRole,
  hasResourceRole,
} from "./tokens";
export { setAuthMarkerCookie, clearAuthMarkerCookie } from "./auth-marker";
export { AUTH_MARKER_COOKIE, getKeycloakConfig } from "./config";
export { getKeycloak, initKeycloak } from "./instance";
export {
  fetchCurrentUserBundle,
  profileFromClaims,
  toAuthSessionInfo,
  toLibAuthSession,
} from "./session-builder";
export { consumePostLoginNext, persistPostLoginNext } from "./redirect-state";

export function clearOidcSessionArtifacts(): void {
  clearKeycloakTokens();
  hydrateInFlight = null;
  lastHydratedSession = null;
}

/** True while Keycloak RP-initiated logout redirect is in flight. */
let logoutInProgress = false;

export function isLogoutInProgress(): boolean {
  return logoutInProgress;
}

export async function ensureKeycloakReady(): Promise<boolean> {
  if (!isKeycloakEnabled()) return false;
  return initKeycloak();
}

/** Coalesce concurrent post-login hydrations (provider + callback + Strict Mode). */
let hydrateInFlight: Promise<AuthSessionInfo | null> | null = null;
/** Survives Strict Mode remounts so we do not re-hit /me after a successful hydrate. */
let lastHydratedSession: { tokenTail: string; session: AuthSessionInfo } | null = null;

function tokenTail(token: string): string {
  return token.length <= 48 ? token : token.slice(-48);
}

async function hydrateSession(): Promise<AuthSessionInfo | null> {
  const accessToken = getAccessToken();
  if (!accessToken) return null;

  const cached = lastHydratedSession;
  if (cached && cached.tokenTail === tokenTail(accessToken)) {
    return cached.session;
  }

  if (hydrateInFlight) return hydrateInFlight;

  hydrateInFlight = (async () => {
    const refreshed = await refreshAccessToken(30);
    const token = refreshed?.accessToken ?? accessToken;
    const existing = lastHydratedSession;
    if (existing && existing.tokenTail === tokenTail(token)) {
      return existing.session;
    }
    const { profile, organizationId } = await fetchCurrentUserBundle(token);
    const session = toAuthSessionInfo(profile, organizationId);
    setAuthMarkerCookie();
    lastHydratedSession = { tokenTail: tokenTail(token), session };
    return session;
  })().finally(() => {
    hydrateInFlight = null;
  });

  return hydrateInFlight;
}

/** Redirect to Keycloak login — does not return. */
export async function beginLoginRedirect(options?: { next?: string }): Promise<never> {
  if (typeof window === "undefined") {
    throw new Error("Keycloak login requires a browser");
  }
  await ensureKeycloakReady();
  persistPostLoginNext(options?.next);
  const config = getKeycloakConfig();
  await getKeycloak().login({
    redirectUri: config.redirectUri,
  });
  throw new AuthenticationError("Redirecting to identity provider");
}

/** Redirect to Keycloak registration — does not return. */
export async function beginRegisterRedirect(options?: { next?: string }): Promise<never> {
  if (typeof window === "undefined") {
    throw new Error("Keycloak registration requires a browser");
  }
  await ensureKeycloakReady();
  persistPostLoginNext(options?.next);
  const config = getKeycloakConfig();
  await getKeycloak().register({
    redirectUri: config.redirectUri,
  });
  throw new AuthenticationError("Redirecting to registration");
}

/** Redirect to Keycloak password reset — does not return. */
export async function beginPasswordResetRedirect(): Promise<never> {
  if (typeof window === "undefined") {
    throw new Error("Keycloak password reset requires a browser");
  }
  await ensureKeycloakReady();
  const config = getKeycloakConfig();
  await getKeycloak().login({
    action: "UPDATE_PASSWORD",
    redirectUri: config.redirectUri,
  });
  throw new AuthenticationError("Redirecting to password reset");
}

export async function buildSessionIfAuthenticated(): Promise<AuthSessionInfo | null> {
  await ensureKeycloakReady();
  if (!isAuthenticated()) {
    clearAuthMarkerCookie();
    return null;
  }
  return hydrateSession();
}

export async function completeLoginAfterRedirect(): Promise<{
  session: AuthSessionInfo;
  next: string | null;
}> {
  await ensureKeycloakReady();
  if (!isAuthenticated()) {
    throw new AuthenticationError("Authentication was not completed. Please sign in again.");
  }
  const session = await hydrateSession();
  if (!session) {
    throw new AuthenticationError("Unable to load your profile. Please sign in again.");
  }
  return { session, next: consumePostLoginNext() };
}

export async function keycloakLogout(): Promise<void> {
  const config = getKeycloakConfig();
  logoutInProgress = true;
  clearAuthMarkerCookie();
  // Keep adapter tokens until logout() runs — it needs id_token_hint.
  hydrateInFlight = null;
  lastHydratedSession = null;
  try {
    await ensureKeycloakReady();
    await getKeycloak().logout({
      redirectUri: config.postLogoutRedirectUri,
    });
  } catch {
    clearKeycloakTokens();
    if (typeof window !== "undefined") {
      window.location.assign(config.postLogoutRedirectUri);
    }
  }
}
