/**
 * Application-level constants — environment-agnostic product metadata.
 * Feature domains must not hardcode product name / support URLs.
 */

export const appConfig = {
  name: "DevFlow Enterprise",
  shortName: "DevFlow",
  description: "Engineering operations platform",
  supportEmail: "support@devflow.example",
  defaultLocale: "en-US",
  defaultTheme: "dark" as const,
} as const;

export type AppConfig = typeof appConfig;
