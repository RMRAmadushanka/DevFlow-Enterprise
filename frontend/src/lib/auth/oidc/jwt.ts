import type { Role } from "@/lib/permissions";

export interface JwtClaims {
  sub: string;
  preferred_username?: string;
  email?: string;
  given_name?: string;
  family_name?: string;
  name?: string;
  email_verified?: boolean;
  realm_access?: { roles?: string[] };
  exp?: number;
  iat?: number;
}

/** Decode JWT payload without verifying signature (Gateway validates). */
export function decodeJwtPayload(token: string): JwtClaims | null {
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;
    const payload = parts[1]!.replace(/-/g, "+").replace(/_/g, "/");
    const padded = payload + "=".repeat((4 - (payload.length % 4)) % 4);
    const json = atob(padded);
    return JSON.parse(json) as JwtClaims;
  } catch {
    return null;
  }
}

export function mapRealmRolesToUiRole(roles: string[] | undefined): Role {
  const set = new Set((roles ?? []).map((r) => r.toUpperCase()));
  if (set.has("SUPER_ADMIN") || set.has("PLATFORM_ADMIN") || set.has("ADMIN")) return "admin";
  if (set.has("MANAGER")) return "manager";
  if (set.has("DEVELOPER") || set.has("QA")) return "developer";
  if (set.has("VIEWER") || set.has("GUEST")) return "viewer";
  return "developer";
}

export function realmRolesFromClaims(claims: JwtClaims): string[] {
  return claims.realm_access?.roles ?? [];
}
