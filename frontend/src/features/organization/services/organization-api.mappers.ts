/**
 * Maps organization-service DTOs ↔ organization UI models.
 */

import type { Role } from "@/lib/permissions";
import { PERMISSIONS, ROLE_LABELS, ROLE_PERMISSIONS, ROLES } from "@/lib/permissions";
import type {
  Invitation as ApiInvitation,
  Membership,
  Organization as ApiOrganization,
  OrganizationRoleCode,
  Team as ApiTeam,
} from "@/lib/api/types/organization";
import type { User } from "@/lib/api/types/user";

import { PERMISSION_LABELS } from "../constants/organization.constants";
import type {
  CreateOrganizationPayload,
  Organization,
  OrganizationStats,
  UpdateOrganizationPayload,
} from "../types/organization.types";
import type {
  Invitation,
  OrganizationMember,
  OrgRoleDefinition,
  PermissionMatrixState,
  Team,
} from "../types/member.types";
function displayNameFromParts(
  first?: string | null,
  last?: string | null,
  fallback = "User"
): string {
  const name = `${first ?? ""} ${last ?? ""}`.trim();
  return name || fallback;
}

/** Backend org roles ↔ UI Role ladder (manager has no BE equivalent). */
export function toUiOrgRole(roleCode: OrganizationRoleCode | string | null | undefined): Role {
  switch ((roleCode ?? "MEMBER").toUpperCase()) {
    case "OWNER":
      return "owner";
    case "ADMIN":
      return "admin";
    case "GUEST":
      return "viewer";
    case "MEMBER":
    default:
      return "developer";
  }
}

export function toBackendOrgRole(role: Role): OrganizationRoleCode {
  switch (role) {
    case "owner":
      return "OWNER";
    case "admin":
      return "ADMIN";
    case "viewer":
      return "GUEST";
    case "manager":
    case "developer":
    default:
      return "MEMBER";
  }
}

export function toUiOrganization(
  org: ApiOrganization,
  extras?: {
    myRole?: Role;
    memberCount?: number;
    activeProjectCount?: number;
  }
): Organization {
  return {
    id: org.id,
    name: org.name,
    slug: org.slug,
    description: org.description ?? "",
    industry: "technology",
    timezone: "UTC",
    language: "en",
    dateFormat: "MDY",
    logoUrl: org.logoUrl ?? undefined,
    branding: {
      logoUrl: org.logoUrl ?? undefined,
      primaryColor: "#2563EB",
      accentColor: "#0F172A",
    },
    memberCount: extras?.memberCount ?? 0,
    activeProjectCount: extras?.activeProjectCount ?? 0,
    storageUsedGb: 0,
    storageLimitGb: 25,
    createdAt: org.createdAt,
    myRole: extras?.myRole ?? "developer",
  };
}

export function toCreateOrganizationRequest(payload: CreateOrganizationPayload) {
  return {
    name: payload.name.trim(),
    slug: payload.slug.trim().toLowerCase(),
    description: payload.description?.trim() || null,
    logoUrl: payload.logoUrl || null,
  };
}

export function toUpdateOrganizationRequest(payload: UpdateOrganizationPayload) {
  return {
    name: payload.name?.trim(),
    description: payload.description?.trim() ?? undefined,
  };
}

export function toUiMember(
  membership: Membership,
  user?: User | null
): OrganizationMember {
  const email = user?.email ?? "";
  const name =
    user?.displayName ??
    displayNameFromParts(
      user?.firstName,
      user?.lastName,
      (user?.username ?? email) || "Member"
    );

  return {
    id: membership.id,
    organizationId: membership.organizationId,
    userId: membership.userId,
    name,
    email,
    avatarUrl: user?.avatarUrl ?? undefined,
    role: toUiOrgRole(membership.roleCode),
    status: membership.status === "ACTIVE" ? "active" : "suspended",
    teamIds: [],
    joinedAt: membership.joinedAt ?? membership.createdAt ?? new Date().toISOString(),
  };
}

export function toUiInvitation(invite: ApiInvitation): Invitation {
  return {
    id: invite.id,
    organizationId: invite.organizationId,
    email: invite.email,
    role: toUiOrgRole(invite.roleCode),
    status:
      invite.status === "PENDING"
        ? "pending"
        : invite.status === "ACCEPTED"
          ? "accepted"
          : invite.status === "REVOKED"
            ? "revoked"
            : "expired",
    invitedBy: invite.invitedBy ?? "Unknown",
    createdAt: invite.createdAt ?? new Date().toISOString(),
    expiresAt: invite.expiresAt ?? new Date().toISOString(),
  };
}

export function toUiTeam(team: ApiTeam, memberIds: string[] = []): Team {
  return {
    id: team.id,
    organizationId: team.organizationId,
    name: team.name,
    description: team.description ?? "",
    memberIds,
    createdAt: team.createdAt,
  };
}

export function toOrganizationStats(org: Organization): OrganizationStats {
  return {
    totalMembers: org.memberCount,
    activeProjects: org.activeProjectCount,
    storageUsedGb: org.storageUsedGb,
    storageLimitGb: org.storageLimitGb,
    createdAt: org.createdAt,
  };
}

/** Seeded API roles exposed as UI role definitions (no custom role CRUD on BE). */
export function buildLiveRoleDefinitions(
  org: Organization,
  members: OrganizationMember[]
): OrgRoleDefinition[] {
  const apiRoles: Role[] = ["owner", "admin", "developer", "viewer"];
  return apiRoles.map((role) => ({
    id: `role_${org.id}_${role}`,
    key: role,
    name: ROLE_LABELS[role],
    description: `${ROLE_LABELS[role]} access for ${org.name}`,
    isSystem: true,
    permissions: [...ROLE_PERMISSIONS[role]],
    userCount: members.filter((m) => m.role === role).length,
  }));
}

export function buildLivePermissionMatrix(): PermissionMatrixState {
  const roles = (["owner", "admin", "developer", "viewer"] as Role[]).map((role) => ({
    key: role,
    name: ROLE_LABELS[role],
  }));
  const rows = PERMISSIONS.filter((p) => !p.startsWith("billing")).map((permission) => {
    const meta = PERMISSION_LABELS[permission] ?? {
      label: permission,
      group: "Other",
    };
    const roleFlags = Object.fromEntries(
      roles.map(({ key }) => [
        key,
        ROLE_PERMISSIONS[key as Role]?.includes(permission) ?? false,
      ])
    ) as Record<string, boolean>;
    return {
      permission,
      label: meta.label,
      group: meta.group,
      roles: roleFlags,
    };
  });
  return { roles, rows };
}

export function slugifyTeamName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48) || `team-${Date.now().toString(36)}`;
}

void ROLES; // retained for parity with mock role ladder
