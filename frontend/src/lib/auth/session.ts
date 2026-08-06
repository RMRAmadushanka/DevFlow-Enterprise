import type { AuthSession } from "./types";

/**
 * Session accessors — stubs for the architecture layer.
 * Replace implementations when auth integration lands; keep the surface stable.
 */

export function getClientSession(): AuthSession | null {
  // Intentionally unimplemented — no real auth wiring in the architecture pass.
  return null;
}

export function requireClientSession(): AuthSession {
  const session = getClientSession();
  if (!session) {
    throw new Error("No authenticated session. Wire lib/auth before using requireClientSession().");
  }
  return session;
}
