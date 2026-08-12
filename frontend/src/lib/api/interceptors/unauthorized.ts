/**
 * Central 401 handling after optional access-token refresh retry in apiClient.
 * Default browser behavior: redirect to login. Tests / SSR can override or disable.
 */

export type UnauthorizedHandler = (context: {
  path: string;
  correlationId?: string;
}) => void | Promise<void>;

let handler: UnauthorizedHandler | null = null;
let redirecting = false;

export function setUnauthorizedHandler(next: UnauthorizedHandler | null): void {
  handler = next;
}

export function getUnauthorizedHandler(): UnauthorizedHandler | null {
  return handler;
}

/** Built-in redirect used when no custom handler is registered (browser only). */
export function defaultUnauthorizedRedirect(): void {
  if (typeof window === "undefined" || redirecting) return;
  redirecting = true;
  const next = `${window.location.pathname}${window.location.search}`;
  const params = new URLSearchParams();
  if (next && next !== "/login" && next.startsWith("/") && !next.startsWith("//")) {
    params.set("next", next);
  }
  const qs = params.toString();
  window.location.assign(qs ? `/login?${qs}` : "/login");
}

export async function notifyUnauthorized(context: {
  path: string;
  correlationId?: string;
}): Promise<void> {
  if (handler) {
    await handler(context);
    return;
  }
  defaultUnauthorizedRedirect();
}

/** Test helper — reset module state. */
export function resetUnauthorizedHandlerForTests(): void {
  handler = null;
  redirecting = false;
}
