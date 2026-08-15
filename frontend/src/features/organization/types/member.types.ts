import type { Role } from "@/lib/permissions";

export type MemberStatus = "active" | "invited" | "suspended";

export interface OrganizationMember {
  id: string;
  organizationId: string;
  userId: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role: Role;
  status: MemberStatus;
  teamIds: string[];
  joinedAt: string;
}

export interface Invitation {
  id: string;
  organizationId: string;
  email: string;
  role: Role;
  teamId?: string;
  message?: string;
  status: "pending" | "accepted" | "expired" | "revoked";
  invitedBy: string;
  createdAt: string;
  expiresAt: string;
}

export interface InviteMemberPayload {
  email: string;
  role: Role;
  teamId?: string;
  message?: string;
}

export interface ChangeMemberRolePayload {
  memberId: string;
  role: Role;
}

export interface Team {
  id: string;
  organizationId: string;
  name: string;
  description: string;
  memberIds: string[];
  createdAt: string;
}

export interface CreateTeamPayload {
  name: string;
  description: string;
  memberIds?: string[];
}

export interface UpdateTeamPayload {
  name?: string;
  description?: string;
  memberIds?: string[];
}

export interface OrgRoleDefinition {
  id: string;
  key: Role | string;
  name: string;
  description: string;
  isSystem: boolean;
  permissions: string[];
  userCount: number;
}

export interface PermissionMatrixRow {
  permission: string;
  label: string;
  group: string;
  roles: Record<string, boolean>;
}

export interface PermissionMatrixState {
  roles: Array<{ key: string; name: string }>;
  rows: PermissionMatrixRow[];
}
