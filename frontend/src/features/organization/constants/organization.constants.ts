import type { SettingsNavItem } from "@/components/layout/page-templates";
import { routes } from "@/config/routes";

export const ORG_STORAGE_KEY = "devflow.activeOrganizationId";

export const organizationKeys = {
  all: ["organizations"] as const,
  lists: () => [...organizationKeys.all, "list"] as const,
  list: (params?: { q?: string }) => [...organizationKeys.lists(), params ?? {}] as const,
  details: () => [...organizationKeys.all, "detail"] as const,
  detail: (id: string) => [...organizationKeys.details(), id] as const,
  stats: (id: string) => [...organizationKeys.detail(id), "stats"] as const,
  activity: (id: string) => [...organizationKeys.detail(id), "activity"] as const,
  audit: (id: string) => [...organizationKeys.detail(id), "audit"] as const,
  members: (orgId: string) => [...organizationKeys.detail(orgId), "members"] as const,
  invitations: (orgId: string) => [...organizationKeys.detail(orgId), "invitations"] as const,
  roles: (orgId: string) => [...organizationKeys.detail(orgId), "roles"] as const,
  matrix: (orgId: string) => [...organizationKeys.detail(orgId), "matrix"] as const,
  teams: (orgId: string) => [...organizationKeys.detail(orgId), "teams"] as const,
  team: (orgId: string, teamId: string) => [...organizationKeys.teams(orgId), teamId] as const,
};

export const ORGANIZATION_SETTINGS_NAV: SettingsNavItem[] = [
  {
    id: "general",
    label: "General",
    href: routes.app.settings.organization,
  },
  {
    id: "members",
    label: "Members",
    href: routes.app.settings.members,
  },
  {
    id: "roles",
    label: "Roles",
    href: routes.app.settings.roles,
  },
];

export const INDUSTRY_OPTIONS = [
  { value: "technology", label: "Technology" },
  { value: "finance", label: "Finance" },
  { value: "healthcare", label: "Healthcare" },
  { value: "education", label: "Education" },
  { value: "retail", label: "Retail" },
  { value: "other", label: "Other" },
] as const;

export const TIMEZONE_OPTIONS = [
  { value: "UTC", label: "UTC" },
  { value: "America/New_York", label: "America/New_York" },
  { value: "America/Los_Angeles", label: "America/Los_Angeles" },
  { value: "Europe/London", label: "Europe/London" },
  { value: "Asia/Kolkata", label: "Asia/Kolkata" },
  { value: "Asia/Tokyo", label: "Asia/Tokyo" },
] as const;

export const LANGUAGE_OPTIONS = [
  { value: "en", label: "English" },
  { value: "es", label: "Spanish" },
  { value: "fr", label: "French" },
  { value: "de", label: "German" },
] as const;

export const DATE_FORMAT_OPTIONS = [
  { value: "MDY", label: "MM/DD/YYYY" },
  { value: "DMY", label: "DD/MM/YYYY" },
  { value: "YMD", label: "YYYY-MM-DD" },
] as const;

export const PERMISSION_LABELS: Record<string, { label: string; group: string }> = {
  "organization.read": { label: "View organization", group: "Organization" },
  "organization.create": { label: "Create organization", group: "Organization" },
  "organization.update": { label: "Update organization", group: "Organization" },
  "organization.delete": { label: "Delete organization", group: "Organization" },
  "member.invite": { label: "Invite members", group: "Members" },
  "member.remove": { label: "Remove members", group: "Members" },
  "member.update": { label: "Update member roles", group: "Members" },
  "role.manage": { label: "Manage roles", group: "Roles" },
  "team.manage": { label: "Manage teams", group: "Teams" },
  "org.manage": { label: "Full organization admin", group: "Organization" },
  "project.read": { label: "View projects", group: "Projects" },
  "project.create": { label: "Create projects", group: "Projects" },
  "project.update": { label: "Update projects", group: "Projects" },
  "project.delete": { label: "Delete projects", group: "Projects" },
  "task.read": { label: "View tasks", group: "Tasks" },
  "task.create": { label: "Create tasks", group: "Tasks" },
  "task.update": { label: "Update tasks", group: "Tasks" },
  "task.delete": { label: "Delete tasks", group: "Tasks" },
  "settings.read": { label: "View settings", group: "Settings" },
  "settings.update": { label: "Update settings", group: "Settings" },
  "settings.manage": { label: "Manage settings", group: "Settings" },
};
