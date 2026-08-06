import type { Role } from "@/lib/permissions";

export type OrganizationIndustry =
  | "technology"
  | "finance"
  | "healthcare"
  | "education"
  | "retail"
  | "other";

export type OrganizationMembershipRole = Role;

export interface OrganizationBranding {
  logoUrl?: string;
  primaryColor: string;
  accentColor: string;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  description: string;
  industry: OrganizationIndustry;
  timezone: string;
  language: string;
  dateFormat: "MDY" | "DMY" | "YMD";
  logoUrl?: string;
  branding: OrganizationBranding;
  memberCount: number;
  activeProjectCount: number;
  storageUsedGb: number;
  storageLimitGb: number;
  createdAt: string;
  /** Role of the current user within this organization. */
  myRole: OrganizationMembershipRole;
}

export interface OrganizationStats {
  totalMembers: number;
  activeProjects: number;
  storageUsedGb: number;
  storageLimitGb: number;
  createdAt: string;
}

export interface OrganizationActivityItem {
  id: string;
  actorName: string;
  action: string;
  target: string;
  createdAt: string;
}

export interface AuditLogEntry {
  id: string;
  actorName: string;
  action: string;
  resource: string;
  ipAddress: string;
  createdAt: string;
}

export interface CreateOrganizationPayload {
  name: string;
  slug: string;
  description: string;
  industry: OrganizationIndustry;
  timezone: string;
  logoUrl?: string;
}

export interface UpdateOrganizationPayload {
  name?: string;
  description?: string;
  timezone?: string;
  language?: string;
  dateFormat?: Organization["dateFormat"];
  industry?: OrganizationIndustry;
}

export interface UpdateBrandingPayload {
  logoUrl?: string;
  primaryColor: string;
  accentColor: string;
}

export interface TransferOwnershipPayload {
  memberId: string;
  confirmation: string;
}
