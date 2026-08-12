/** organization-service DTOs (core subset for F2 service module) */

import type { PageQuery, PageResponse } from "./envelope";

export type OrganizationStatus = "ACTIVE" | "SUSPENDED" | "ARCHIVED";
export type OrganizationRoleCode = "OWNER" | "ADMIN" | "MEMBER" | "GUEST";
export type MembershipStatus = "ACTIVE" | "INACTIVE";
export type InvitationStatus = "PENDING" | "ACCEPTED" | "EXPIRED" | "REVOKED";
export type TeamRole = "TEAM_ADMIN" | "TEAM_MEMBER" | "TEAM_VIEWER";

export interface Organization {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  logoUrl?: string | null;
  status: OrganizationStatus;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrganizationRequest {
  name: string;
  slug: string;
  description?: string | null;
  logoUrl?: string | null;
}

export interface UpdateOrganizationRequest {
  name?: string;
  slug?: string;
  description?: string | null;
  logoUrl?: string | null;
  status?: OrganizationStatus;
}

export interface Membership {
  id: string;
  organizationId: string;
  userId: string;
  roleCode: OrganizationRoleCode;
  status: MembershipStatus;
  joinedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AddMemberRequest {
  userId: string;
  roleCode: OrganizationRoleCode;
}

export interface UpdateMemberRequest {
  roleCode?: OrganizationRoleCode;
  status?: MembershipStatus;
}

export interface Invitation {
  id: string;
  organizationId: string;
  email: string;
  roleCode: OrganizationRoleCode;
  status: InvitationStatus;
  expiresAt?: string;
  invitedBy?: string;
  createdAt?: string;
  acceptedAt?: string | null;
  /** Present only on create response */
  token?: string | null;
}

export interface CreateInvitationRequest {
  email: string;
  roleCode: OrganizationRoleCode;
  expiresInDays: number;
}

export interface Team {
  id: string;
  organizationId: string;
  name: string;
  slug: string;
  description?: string | null;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTeamRequest {
  name: string;
  slug: string;
  description?: string | null;
}

export interface UpdateTeamRequest {
  name?: string;
  slug?: string;
  description?: string | null;
}

export interface TeamMembership {
  id: string;
  teamId: string;
  userId: string;
  role: TeamRole;
  joinedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AddTeamMemberRequest {
  userId: string;
  role: TeamRole;
}

export type OrganizationPage<T> = PageResponse<T>;
export type OrganizationListQuery = PageQuery;
