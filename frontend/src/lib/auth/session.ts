import type { AuthSession } from "./types";

/**
 * Session accessors — integration point for `apiClient` Bearer tokens.
 * Do not invent a second auth system: auth features should register a provider
 * that reads the existing session / future Keycloak store.
 */

type SessionProvider = () => AuthSession | null;

let sessionProvider: SessionProvider | null = null;

/**
 * Register the active session source (e.g. from features/auth store or OIDC).
 * Passing `null` clears the provider (tests / logout).
 */
export function registerClientSessionProvider(provider: SessionProvider | null): void {
  sessionProvider = provider;
}

export function getClientSession(): AuthSession | null {
  if (sessionProvider) {
    return sessionProvider();
  }
  // Intentionally empty until auth wires a provider (F3 Keycloak / mock bridge).
  return null;
}

export function requireClientSession(): AuthSession {
  const session = getClientSession();
  if (!session) {
    throw new Error("No authenticated session. Wire lib/auth before using requireClientSession().");
  }
  return session;
}
