/**
 * Live user-service adapter for profile, preferences, and user lookup/search.
 * Toggle: NEXT_PUBLIC_USE_USER_API (defaults ON when API base URL is set).
 */

import { ApiError, organizationApi, userApi } from "@/lib/api";
import type { User } from "@/lib/api/types/user";

import type {
  AuthUserProfile,
  NotificationPreferences,
  UpdatePreferencesPayload,
  UpdateProfilePayload,
} from "../types/auth.types";
import { mapApiError } from "../utils/errors";
import {
  fromNotifyFlags,
  toAuthUserProfile,
  toLocaleTimezonePatch,
  toNotifyFlags,
  toUpdatePreferencesRequest,
  toUpdateProfileRequest,
  toUserSearchResult,
  type UserSearchResult,
} from "./user-api.mappers";

function mapError(error: unknown): never {
  throw mapApiError(error);
}

async function safeGetUser(userId: string): Promise<User | null> {
  try {
    return await userApi.getById(userId);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    return null;
  }
}

export const userApiService = {
  async getCurrentUser(): Promise<AuthUserProfile> {
    try {
      const [user, prefs] = await Promise.all([
        userApi.me(),
        userApi.getPreferences().catch(() => null),
      ]);
      return toAuthUserProfile(user, prefs);
    } catch (error) {
      mapError(error);
    }
  },

  async getProfile(): Promise<AuthUserProfile> {
    try {
      const [profile, prefs] = await Promise.all([
        userApi.getProfile(),
        userApi.getPreferences().catch(() => null),
      ]);
      return toAuthUserProfile(profile, prefs);
    } catch (error) {
      mapError(error);
    }
  },

  async updateProfile(
    payload: UpdateProfilePayload,
    base?: Partial<AuthUserProfile>
  ): Promise<AuthUserProfile> {
    try {
      const profile = await userApi.updateProfile(toUpdateProfileRequest(payload));
      return toAuthUserProfile(profile, null, {
        ...base,
        phone: payload.phone,
        bio: payload.bio,
      });
    } catch (error) {
      mapError(error);
    }
  },

  async updatePreferences(
    payload: UpdatePreferencesPayload,
    base?: Partial<AuthUserProfile>
  ): Promise<AuthUserProfile> {
    try {
      const [prefs, profile] = await Promise.all([
        userApi.updatePreferences(toUpdatePreferencesRequest(payload)),
        userApi.updateProfile(toLocaleTimezonePatch(payload)),
      ]);
      return toAuthUserProfile(profile, prefs, {
        ...base,
        language: payload.language,
        timezone: payload.timezone,
        dateFormat: payload.dateFormat,
      });
    } catch (error) {
      mapError(error);
    }
  },

  async getNotificationPreferences(
    previous?: NotificationPreferences
  ): Promise<NotificationPreferences> {
    try {
      const prefs = await userApi.getPreferences();
      return fromNotifyFlags(prefs, previous);
    } catch (error) {
      mapError(error);
    }
  },

  async updateNotificationPreferences(
    payload: NotificationPreferences
  ): Promise<NotificationPreferences> {
    try {
      const prefs = await userApi.updatePreferences(toNotifyFlags(payload));
      return fromNotifyFlags(prefs, payload);
    } catch (error) {
      mapError(error);
    }
  },

  async getById(userId: string): Promise<UserSearchResult | null> {
    try {
      const user = await userApi.getById(userId);
      return toUserSearchResult(user);
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) return null;
      mapError(error);
    }
  },

  /**
   * User search without a dedicated search API:
   * - UUID lookup via GET /api/users/{id}
   * - Otherwise search organization members hydrated from User Service
   */
  async searchUsers(params: {
    q: string;
    organizationId?: string | null;
    limit?: number;
  }): Promise<UserSearchResult[]> {
    const q = params.q.trim();
    const limit = params.limit ?? 20;
    if (!q) return [];

    const uuidLike =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(q);

    try {
      if (uuidLike) {
        const user = await safeGetUser(q);
        return user ? [toUserSearchResult(user)] : [];
      }

      if (!params.organizationId) return [];

      const page = await organizationApi.listMembers(params.organizationId, {
        page: 0,
        size: 100,
      });

      const hydrated = await Promise.all(
        page.items.map(async (membership) => {
          const user = await safeGetUser(membership.userId);
          return user ? toUserSearchResult(user) : null;
        })
      );

      const needle = q.toLowerCase();
      return hydrated
        .filter((item): item is UserSearchResult => Boolean(item))
        .filter(
          (item) =>
            item.name.toLowerCase().includes(needle) ||
            item.email.toLowerCase().includes(needle) ||
            (item.username?.toLowerCase().includes(needle) ?? false)
        )
        .slice(0, limit);
    } catch (error) {
      mapError(error);
    }
  },
};

import { resolveLiveApiFlag } from "@/lib/api/live-api";

export function isUserApiEnabled(): boolean {
  return resolveLiveApiFlag(process.env.NEXT_PUBLIC_USE_USER_API);
}
