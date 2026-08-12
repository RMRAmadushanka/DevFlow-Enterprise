/**
 * Shared gate for live Gateway APIs.
 * Bearer tokens come from Keycloak OIDC — never enable live APIs under mock-only auth.
 */

export function isApiBaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_API_URL?.trim() || process.env.NEXT_PUBLIC_API_BASE_URL?.trim()
  );
}

export function isOidcConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_KEYCLOAK_URL?.trim());
}

/**
 * True when the app is expected to talk to real Gateway + Keycloak.
 * Stub domains (tasks, sprints, docs, …) must not show seed/demo data in this mode.
 */
export function isLiveBackendMode(): boolean {
  return isApiBaseConfigured() && isOidcConfigured();
}

/**
 * Resolve NEXT_PUBLIC_USE_*_API flags.
 * Live mode requires both Gateway URL and Keycloak URL (for access tokens).
 */
export function resolveLiveApiFlag(flag: string | undefined): boolean {
  if (flag === "false") return false;
  if (!isLiveBackendMode()) return false;
  if (flag === "true") return true;
  return true;
}

/** Throw from stub-domain mutations so UI cannot fake persistence. */
export function rejectStubMutation(feature: string): never {
  throw new Error(
    `${feature} is not connected to a backend service yet. No data was saved.`
  );
}
