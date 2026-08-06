import { routes } from "@/config/routes";

/** Demo account for local frontend auth (mock service only). */
export const DEMO_CREDENTIALS = {
  email: "demo@devflow.app",
  password: "Password123!",
} as const;

export const AUTH_STORAGE_KEYS = {
  session: "devflow.auth.session",
  remember: "devflow.auth.remember",
} as const;

export const TIMEZONE_OPTIONS = [
  { value: "UTC", label: "UTC" },
  { value: "America/New_York", label: "Eastern Time (US)" },
  { value: "America/Chicago", label: "Central Time (US)" },
  { value: "America/Los_Angeles", label: "Pacific Time (US)" },
  { value: "Europe/London", label: "London" },
  { value: "Europe/Berlin", label: "Berlin" },
  { value: "Asia/Kolkata", label: "India (Kolkata)" },
  { value: "Asia/Singapore", label: "Singapore" },
  { value: "Asia/Tokyo", label: "Tokyo" },
] as const;

export const LANGUAGE_OPTIONS = [
  { value: "en", label: "English" },
  { value: "es", label: "Español" },
  { value: "fr", label: "Français" },
  { value: "de", label: "Deutsch" },
] as const;

export const DATE_FORMAT_OPTIONS = [
  { value: "MDY", label: "MM/DD/YYYY" },
  { value: "DMY", label: "DD/MM/YYYY" },
  { value: "YMD", label: "YYYY-MM-DD" },
] as const;

export const ACCOUNT_NAV = [
  { id: "profile", label: "Profile", href: routes.app.profile },
  { id: "preferences", label: "Preferences", href: routes.app.account.settings },
  { id: "notifications", label: "Notifications", href: routes.app.account.notifications },
  { id: "security", label: "Security", href: routes.app.account.security },
] as const;

export const authKeys = {
  all: ["auth"] as const,
  session: () => [...authKeys.all, "session"] as const,
  sessions: () => [...authKeys.all, "sessions"] as const,
  loginHistory: () => [...authKeys.all, "login-history"] as const,
  apiKeys: () => [...authKeys.all, "api-keys"] as const,
  notifications: () => [...authKeys.all, "notification-prefs"] as const,
};
