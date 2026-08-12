import { apiClient } from "../client";
import type { PageResponse } from "../types/envelope";
import type {
  OrganizationSummary,
  UpdateUserPreferenceRequest,
  UpdateUserProfileRequest,
  User,
  UserPreference,
  UserProfile,
} from "../types/user";

/** Typed Gateway client for user-service (`/api/users`). */
export const userApi = {
  me(): Promise<User> {
    return apiClient<User>("/api/users/me");
  },

  getById(userId: string): Promise<User> {
    return apiClient<User>(`/api/users/${userId}`);
  },

  getByExternalId(externalIdentityId: string): Promise<User> {
    return apiClient<User>(`/api/users/by-external-id/${externalIdentityId}`);
  },

  getProfile(): Promise<UserProfile> {
    return apiClient<UserProfile>("/api/users/me/profile");
  },

  updateProfile(body: UpdateUserProfileRequest): Promise<UserProfile> {
    return apiClient<UserProfile>("/api/users/me", { method: "PATCH", body });
  },

  getPreferences(): Promise<UserPreference> {
    return apiClient<UserPreference>("/api/users/me/preferences");
  },

  updatePreferences(body: UpdateUserPreferenceRequest): Promise<UserPreference> {
    return apiClient<UserPreference>("/api/users/me/preferences", {
      method: "PATCH",
      body,
    });
  },

  getOrganizations(
    userId: string,
    query?: { page?: number; size?: number }
  ): Promise<PageResponse<OrganizationSummary>> {
    return apiClient<PageResponse<OrganizationSummary>>(
      `/api/users/${userId}/organizations`,
      { query }
    );
  },
};
