import { permissionsForRole } from "@/lib/permissions";

import { AUTH_STORAGE_KEYS, DEMO_CREDENTIALS } from "../constants/auth.constants";
import { AuthenticationError, NetworkError, ValidationError } from "../utils/errors";
import type {
  ActiveSession,
  ApiKeyRecord,
  AuthSessionInfo,
  AuthUserProfile,
  ChangePasswordPayload,
  ForgotPasswordPayload,
  LoginHistoryEntry,
  LoginPayload,
  NotificationPreferences,
  RegisterPayload,
  ResetPasswordPayload,
  SocialProvider,
  UpdatePreferencesPayload,
  UpdateProfilePayload,
} from "../types/auth.types";

const delay = (ms = 450) => new Promise((resolve) => setTimeout(resolve, ms));

function createDemoUser(overrides: Partial<AuthUserProfile> = {}): AuthUserProfile {
  return {
    id: "user_demo",
    email: DEMO_CREDENTIALS.email,
    firstName: "Avery",
    lastName: "Chen",
    name: "Avery Chen",
    phone: "+1 555 0100",
    timezone: "America/New_York",
    bio: "Engineering lead at DevFlow.",
    avatarUrl: undefined,
    role: "admin",
    emailVerified: true,
    twoFactorEnabled: false,
    language: "en",
    dateFormat: "MDY",
    createdAt: "2025-01-12T10:00:00.000Z",
    ...overrides,
  };
}

let memoryUser = createDemoUser();
let memoryPassword: string = DEMO_CREDENTIALS.password;
let memorySessions: ActiveSession[] = [
  {
    id: "sess_current",
    device: "Windows PC",
    browser: "Chrome",
    location: "Bengaluru, IN",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    lastActiveAt: new Date().toISOString(),
    current: true,
  },
  {
    id: "sess_laptop",
    device: "MacBook Pro",
    browser: "Safari",
    location: "San Francisco, US",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    lastActiveAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
  },
];
let memoryHistory: LoginHistoryEntry[] = [
  {
    id: "hist_1",
    at: new Date().toISOString(),
    ip: "203.0.113.10",
    location: "Bengaluru, IN",
    browser: "Chrome",
    success: true,
  },
  {
    id: "hist_2",
    at: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(),
    ip: "198.51.100.22",
    location: "Unknown",
    browser: "Firefox",
    success: false,
  },
];
let memoryApiKeys: ApiKeyRecord[] = [
  {
    id: "key_1",
    name: "CI Pipeline",
    prefix: "df_live_ab12",
    createdAt: "2025-11-01T08:00:00.000Z",
    lastUsedAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
  },
];
let memoryNotifications: NotificationPreferences = {
  emailProduct: true,
  emailSecurity: true,
  emailMarketing: false,
  inAppMentions: true,
  inAppDeployments: true,
};

function readStoredSession(): AuthSessionInfo | null {
  if (typeof window === "undefined") return null;
  try {
    const raw =
      window.sessionStorage.getItem(AUTH_STORAGE_KEYS.session) ??
      window.localStorage.getItem(AUTH_STORAGE_KEYS.session);
    if (!raw) return null;
    return JSON.parse(raw) as AuthSessionInfo;
  } catch {
    return null;
  }
}

function writeSession(session: AuthSessionInfo, remember: boolean) {
  if (typeof window === "undefined") return;
  const raw = JSON.stringify(session);
  window.sessionStorage.setItem(AUTH_STORAGE_KEYS.session, raw);
  if (remember) {
    window.localStorage.setItem(AUTH_STORAGE_KEYS.session, raw);
    window.localStorage.setItem(AUTH_STORAGE_KEYS.remember, "1");
  } else {
    window.localStorage.removeItem(AUTH_STORAGE_KEYS.session);
    window.localStorage.removeItem(AUTH_STORAGE_KEYS.remember);
  }
}

function clearSessionStorage() {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(AUTH_STORAGE_KEYS.session);
  window.localStorage.removeItem(AUTH_STORAGE_KEYS.session);
  window.localStorage.removeItem(AUTH_STORAGE_KEYS.remember);
}

function toSession(user: AuthUserProfile): AuthSessionInfo {
  return {
    user,
    organizationId: "org_demo",
    permissions: [...permissionsForRole(user.role)],
    sessionId: `sess_${user.id}_${Date.now().toString(36)}`,
  };
}

/**
 * Frontend-only auth service — simulates network I/O.
 * Never persists passwords; demo credentials are in-memory only.
 */
export const authService = {
  async getSession(): Promise<AuthSessionInfo | null> {
    await delay(120);
    const stored = readStoredSession();
    if (!stored) return null;
    memoryUser = { ...memoryUser, ...stored.user };
    return { ...stored, user: memoryUser };
  },

  async login(payload: LoginPayload): Promise<AuthSessionInfo> {
    await delay();
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      throw new NetworkError();
    }
    const email = payload.email.trim().toLowerCase();
    if (email !== memoryUser.email.toLowerCase() || payload.password !== memoryPassword) {
      throw new AuthenticationError("Invalid email or password");
    }
    const session = toSession(memoryUser);
    writeSession(session, Boolean(payload.rememberMe));
    memoryHistory = [
      {
        id: `hist_${Date.now()}`,
        at: new Date().toISOString(),
        ip: "203.0.113.10",
        location: "Bengaluru, IN",
        browser: "Chrome",
        success: true,
      },
      ...memoryHistory,
    ];
    return session;
  },

  async register(payload: RegisterPayload): Promise<{ requiresVerification: true; email: string }> {
    await delay();
    if (!payload.acceptTerms) throw new ValidationError("You must accept the terms");
    memoryUser = createDemoUser({
      id: `user_${Date.now().toString(36)}`,
      email: payload.email.trim().toLowerCase(),
      firstName: payload.firstName,
      lastName: payload.lastName,
      name: `${payload.firstName} ${payload.lastName}`,
      emailVerified: false,
      role: "developer",
    });
    memoryPassword = payload.password;
    clearSessionStorage();
    return { requiresVerification: true, email: memoryUser.email };
  },

  async logout(): Promise<void> {
    await delay(200);
    clearSessionStorage();
  },

  async socialLogin(provider: SocialProvider): Promise<AuthSessionInfo> {
    await delay();
    memoryUser = createDemoUser({
      email: `${provider}.user@devflow.app`,
      firstName: provider[0]!.toUpperCase() + provider.slice(1),
      lastName: "User",
      name: `${provider[0]!.toUpperCase()}${provider.slice(1)} User`,
    });
    const session = toSession(memoryUser);
    writeSession(session, true);
    return session;
  },

  async forgotPassword(payload: ForgotPasswordPayload): Promise<{ sent: true }> {
    await delay();
    if (!payload.email.includes("@")) throw new ValidationError("Enter a valid email");
    return { sent: true };
  },

  async resetPassword(payload: ResetPasswordPayload): Promise<void> {
    await delay();
    if (!payload.token || payload.token === "expired") {
      throw new ValidationError("This reset link is invalid or has expired");
    }
    memoryPassword = payload.password;
  },

  async verifyEmail(token: string): Promise<"success" | "expired" | "invalid"> {
    await delay(700);
    if (!token) return "invalid";
    if (token === "expired") return "expired";
    if (token === "invalid") return "invalid";
    memoryUser = { ...memoryUser, emailVerified: true };
    const session = toSession(memoryUser);
    writeSession(session, true);
    return "success";
  },

  async resendVerification(email: string): Promise<void> {
    await delay();
    if (!email) throw new ValidationError("Email is required");
  },

  async updateProfile(payload: UpdateProfilePayload): Promise<AuthUserProfile> {
    await delay();
    memoryUser = {
      ...memoryUser,
      ...payload,
      phone: payload.phone || undefined,
      bio: payload.bio || undefined,
      avatarUrl: payload.avatarUrl || undefined,
      name: `${payload.firstName} ${payload.lastName}`,
    };
    const existing = readStoredSession();
    if (existing) writeSession({ ...existing, user: memoryUser }, true);
    return memoryUser;
  },

  async updatePreferences(payload: UpdatePreferencesPayload): Promise<AuthUserProfile> {
    await delay();
    memoryUser = {
      ...memoryUser,
      language: payload.language,
      timezone: payload.timezone,
      dateFormat: payload.dateFormat,
    };
    const existing = readStoredSession();
    if (existing) writeSession({ ...existing, user: memoryUser }, true);
    return memoryUser;
  },

  async changePassword(payload: ChangePasswordPayload): Promise<void> {
    await delay();
    if (payload.currentPassword !== memoryPassword) {
      throw new AuthenticationError("Current password is incorrect");
    }
    memoryPassword = payload.newPassword;
  },

  async listSessions(): Promise<ActiveSession[]> {
    await delay(300);
    return memorySessions;
  },

  async revokeSession(sessionId: string): Promise<void> {
    await delay(250);
    memorySessions = memorySessions.filter((s) => s.id !== sessionId);
  },

  async listLoginHistory(): Promise<LoginHistoryEntry[]> {
    await delay(300);
    return memoryHistory;
  },

  async setTwoFactorEnabled(enabled: boolean): Promise<AuthUserProfile> {
    await delay(300);
    memoryUser = { ...memoryUser, twoFactorEnabled: enabled };
    const existing = readStoredSession();
    if (existing) writeSession({ ...existing, user: memoryUser }, true);
    return memoryUser;
  },

  async listApiKeys(): Promise<ApiKeyRecord[]> {
    await delay(300);
    return memoryApiKeys.map(({ id, name, prefix, createdAt, lastUsedAt }) => ({
      id,
      name,
      prefix,
      createdAt,
      lastUsedAt,
    }));
  },

  async createApiKey(name: string): Promise<ApiKeyRecord> {
    await delay();
    const secret = `df_live_${Math.random().toString(36).slice(2, 10)}_${Math.random().toString(36).slice(2, 18)}`;
    const record: ApiKeyRecord = {
      id: `key_${Date.now().toString(36)}`,
      name,
      prefix: secret.slice(0, 12),
      createdAt: new Date().toISOString(),
      secret,
    };
    memoryApiKeys = [{ ...record, secret: undefined }, ...memoryApiKeys];
    return record;
  },

  async revokeApiKey(id: string): Promise<void> {
    await delay(250);
    memoryApiKeys = memoryApiKeys.filter((key) => key.id !== id);
  },

  async getNotificationPreferences(): Promise<NotificationPreferences> {
    await delay(200);
    return memoryNotifications;
  },

  async updateNotificationPreferences(
    payload: NotificationPreferences
  ): Promise<NotificationPreferences> {
    await delay(250);
    memoryNotifications = payload;
    return memoryNotifications;
  },
};
