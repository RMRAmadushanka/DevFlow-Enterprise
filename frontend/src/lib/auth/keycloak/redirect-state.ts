/**
 * Non-token app state for OIDC redirects (safe to store — not credentials).
 */

const NEXT_PATH_KEY = "devflow.auth.next";

export function persistPostLoginNext(next?: string | null): void {
  if (typeof window === "undefined") return;
  if (next && next.startsWith("/") && !next.startsWith("//")) {
    sessionStorage.setItem(NEXT_PATH_KEY, next);
  } else {
    sessionStorage.removeItem(NEXT_PATH_KEY);
  }
}

export function consumePostLoginNext(): string | null {
  if (typeof window === "undefined") return null;
  const value = sessionStorage.getItem(NEXT_PATH_KEY);
  sessionStorage.removeItem(NEXT_PATH_KEY);
  return value;
}
