import { permissionsForRole } from "@/lib/permissions";
import type { Role } from "@/lib/permissions";
import { apiClient } from "@/lib/api/client";
import type { CurrentUser } from "@/lib/api/types/auth";
import type { User } from "@/lib/api/types/user";
import type { AuthSession } from "../types";
import type { AuthSessionInfo, AuthUserProfile } from "@/features/auth/types/auth.types";

import { decodeJwtPayload, mapRealmRolesToUiRole, realmRolesFromClaims } from "../oidc/jwt";
import { getAccessToken } from "./tokens";

function displayName(first: string, last: string, fallback: string): string {
  const name = `${first} ${last}`.trim();
  return name || fallback;
}

export function profileFromClaims(
  accessToken: string,
  appUser?: User | null,
  authMe?: CurrentUser | null
): AuthUserProfile {
  const claims = decodeJwtPayload(accessToken);
  const jwtRoles = realmRolesFromClaims(claims ?? { sub: "" });
  const apiRoles = authMe?.roles ?? [];
  const roles = [...jwtRoles, ...apiRoles];
  const role: Role = mapRealmRolesToUiRole(roles);

  const firstName =
    appUser?.firstName ?? authMe?.firstName ?? claims?.given_name ?? "";
  const lastName = appUser?.lastName ?? authMe?.lastName ?? claims?.family_name ?? "";
  const email = appUser?.email ?? authMe?.email ?? claims?.email ?? "";
  const username =
    appUser?.username ?? authMe?.username ?? claims?.preferred_username ?? email ?? "user";

  return {
    id: appUser?.id ?? authMe?.id ?? claims?.sub ?? "unknown",
    email: email || `${username}@unknown.local`,
    firstName: firstName || username,
    lastName: lastName || "",
    name:
      appUser?.displayName ??
      authMe?.username ??
      claims?.name ??
      displayName(firstName, lastName, username),
    timezone: appUser?.timezone ?? "UTC",
    avatarUrl: appUser?.avatarUrl ?? undefined,
    role,
    emailVerified: authMe?.emailVerified ?? Boolean(claims?.email_verified),
    twoFactorEnabled: false,
    language: appUser?.locale ?? "en",
    dateFormat: "MDY",
    createdAt: appUser?.createdAt ?? new Date().toISOString(),
  };
}

export function toAuthSessionInfo(profile: AuthUserProfile, organizationId = ""): AuthSessionInfo {
  return {
    user: profile,
    organizationId,
    permissions: [...permissionsForRole(profile.role)],
    sessionId: `oidc_${profile.id}`,
  };
}

export function toLibAuthSession(session: AuthSessionInfo): AuthSession | null {
  const accessToken = getAccessToken();
  if (!accessToken) return null;
  return {
    user: {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
      avatarUrl: session.user.avatarUrl,
      role: session.user.role,
    },
    organizationId: session.organizationId,
    permissions: session.permissions,
    accessToken,
  };
}

/** Load current user from Gateway using an explicit Bearer (avoids provider bootstrap races). */
export async function fetchCurrentUserBundle(accessToken: string): Promise<{
  profile: AuthUserProfile;
  organizationId: string;
}> {
  let authMe: CurrentUser | null = null;
  let appUser: User | null = null;

  try {
    authMe = await apiClient<CurrentUser>("/api/auth/me", {
      headers: { Authorization: `Bearer ${accessToken}` },
      skipAuthHandler: true,
    });
  } catch {
    authMe = null;
  }

  try {
    appUser = await apiClient<User>("/api/users/me", {
      headers: { Authorization: `Bearer ${accessToken}` },
      skipAuthHandler: true,
    });
  } catch {
    appUser = null;
  }

  let organizationId = "";
  if (appUser?.id) {
    try {
      const orgs = await apiClient<{
        items: Array<{ id: string }>;
      }>(`/api/users/${appUser.id}/organizations`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        skipAuthHandler: true,
        query: { page: 0, size: 1 },
      });
      organizationId = orgs.items[0]?.id ?? "";
    } catch {
      organizationId = "";
    }
  }

  return {
    profile: profileFromClaims(accessToken, appUser, authMe),
    organizationId,
  };
}
