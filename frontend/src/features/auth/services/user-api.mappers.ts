/**
 * Maps user-service DTOs ↔ auth UI profile/preference shapes.
 */

import type { Role } from "@/lib/permissions";
import type { User, UserPreference, UserProfile } from "@/lib/api/types/user";

import type {
  AuthUserProfile,
  NotificationPreferences,
  UpdatePreferencesPayload,
  UpdateProfilePayload,
} from "../types/auth.types";

export function displayNameFromParts(
  first?: string | null,
  last?: string | null,
  fallback = "User"
): string {
  const name = `${first ?? ""} ${last ?? ""}`.trim();
  return name || fallback;
}

export function toAuthUserProfile(
  user: User | UserProfile,
  prefs?: UserPreference | null,
  base?: Partial<AuthUserProfile>
): AuthUserProfile {
  const firstName = user.firstName ?? base?.firstName ?? "";
  const lastName = user.lastName ?? base?.lastName ?? "";
  const email = user.email ?? base?.email ?? "";
  const username = "username" in user ? user.username : email;

  return {
    id: user.id,
    email: email || `${username}@unknown.local`,
    firstName: firstName || username,
    lastName: lastName || "",
    name:
      user.displayName ??
      displayNameFromParts(firstName, lastName, username),
    phone: base?.phone,
    timezone: user.timezone ?? base?.timezone ?? "UTC",
    bio: base?.bio,
    avatarUrl: user.avatarUrl ?? base?.avatarUrl ?? undefined,
    role: (base?.role ?? "developer") as Role,
    emailVerified: base?.emailVerified ?? true,
    twoFactorEnabled: base?.twoFactorEnabled ?? false,
    language: user.locale ?? base?.language ?? "en",
    dateFormat: base?.dateFormat ?? "MDY",
    createdAt: user.createdAt ?? base?.createdAt ?? new Date().toISOString(),
    ...(prefs
      ? {
          /* theme lives on preferences; UI stores language/timezone on profile */
        }
      : {}),
  };
}

export function toUpdateProfileRequest(payload: UpdateProfilePayload) {
  return {
    firstName: payload.firstName,
    lastName: payload.lastName,
    displayName: displayNameFromParts(payload.firstName, payload.lastName),
    avatarUrl: payload.avatarUrl ?? null,
    timezone: payload.timezone,
  };
}

export function toUpdatePreferencesRequest(payload: UpdatePreferencesPayload) {
  return {
    theme: payload.theme,
  };
}

export function toLocaleTimezonePatch(payload: UpdatePreferencesPayload) {
  return {
    timezone: payload.timezone,
    locale: payload.language,
  };
}

/** Map granular notification UI → user-service preference flags. */
export function toNotifyFlags(prefs: NotificationPreferences): {
  notifyEmail: boolean;
  notifyInApp: boolean;
} {
  return {
    notifyEmail: prefs.emailProduct || prefs.emailSecurity || prefs.emailMarketing,
    notifyInApp: prefs.inAppMentions || prefs.inAppDeployments,
  };
}

export function fromNotifyFlags(
  prefs: UserPreference,
  previous?: NotificationPreferences
): NotificationPreferences {
  return {
    emailProduct: prefs.notifyEmail,
    emailSecurity: prefs.notifyEmail,
    emailMarketing: previous?.emailMarketing ?? false,
    inAppMentions: prefs.notifyInApp,
    inAppDeployments: previous?.inAppDeployments ?? prefs.notifyInApp,
  };
}

/** Lightweight user row for search / invite pickers. */
export interface UserSearchResult {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  username?: string;
}

export function toUserSearchResult(user: User): UserSearchResult {
  return {
    id: user.id,
    email: user.email ?? "",
    name:
      user.displayName ??
      displayNameFromParts(user.firstName, user.lastName, user.username),
    avatarUrl: user.avatarUrl ?? undefined,
    username: user.username,
  };
}
