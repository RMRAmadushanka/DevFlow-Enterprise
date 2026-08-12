/** user-service DTOs */

export type UserStatus = "ACTIVE" | "INACTIVE" | "SUSPENDED" | "PENDING" | "DELETED";

export interface User {
  id: string;
  externalIdentityId: string;
  username: string;
  email?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  displayName?: string | null;
  avatarUrl?: string | null;
  timezone?: string | null;
  locale?: string | null;
  status: UserStatus;
  theme?: string | null;
  notifyEmail: boolean;
  notifyInApp: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  id: string;
  externalIdentityId: string;
  username: string;
  email?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  displayName?: string | null;
  avatarUrl?: string | null;
  timezone?: string | null;
  locale?: string | null;
  status: UserStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserPreference {
  userId: string;
  theme?: string | null;
  notifyEmail: boolean;
  notifyInApp: boolean;
}

export interface UpdateUserProfileRequest {
  firstName?: string | null;
  lastName?: string | null;
  displayName?: string | null;
  avatarUrl?: string | null;
  timezone?: string | null;
  locale?: string | null;
}

export interface UpdateUserPreferenceRequest {
  theme?: string | null;
  notifyEmail?: boolean;
  notifyInApp?: boolean;
}

export interface OrganizationSummary {
  id: string;
  name: string;
  slug: string;
  role?: string | null;
}
