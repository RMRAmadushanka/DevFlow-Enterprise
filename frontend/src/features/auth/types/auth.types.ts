import type { Role } from "@/lib/permissions";

export type AuthStatus = "anonymous" | "authenticated" | "unknown";

export type SocialProvider = "github" | "google" | "microsoft";

export type EmailVerificationStatus =
  | "pending"
  | "checking"
  | "success"
  | "expired"
  | "invalid";

export interface AuthUserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  name: string;
  phone?: string;
  timezone: string;
  bio?: string;
  avatarUrl?: string;
  role: Role;
  emailVerified: boolean;
  twoFactorEnabled: boolean;
  language: string;
  dateFormat: "MDY" | "DMY" | "YMD";
  createdAt: string;
}

export interface AuthSessionInfo {
  user: AuthUserProfile;
  organizationId: string;
  permissions: string[];
  /** Opaque session marker — never a raw password. Cleared on logout. */
  sessionId: string;
}

export interface LoginPayload {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  acceptTerms: boolean;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  token: string;
  password: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export interface UpdateProfilePayload {
  firstName: string;
  lastName: string;
  phone?: string;
  timezone: string;
  bio?: string;
  avatarUrl?: string | null;
}

export interface UpdatePreferencesPayload {
  theme: "light" | "dark" | "system";
  language: string;
  timezone: string;
  dateFormat: AuthUserProfile["dateFormat"];
}

export interface ActiveSession {
  id: string;
  device: string;
  browser: string;
  location: string;
  createdAt: string;
  lastActiveAt: string;
  current?: boolean;
}

export interface LoginHistoryEntry {
  id: string;
  at: string;
  ip: string;
  location: string;
  browser: string;
  success: boolean;
}

export interface ApiKeyRecord {
  id: string;
  name: string;
  prefix: string;
  createdAt: string;
  lastUsedAt?: string;
  /** Only returned once on create — never persisted afterwards. */
  secret?: string;
}

export interface NotificationPreferences {
  emailProduct: boolean;
  emailSecurity: boolean;
  emailMarketing: boolean;
  inAppMentions: boolean;
  inAppDeployments: boolean;
}
