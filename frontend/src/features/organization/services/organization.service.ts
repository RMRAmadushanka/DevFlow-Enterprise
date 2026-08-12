import { PERMISSIONS, ROLE_LABELS, ROLE_PERMISSIONS, ROLES } from "@/lib/permissions";

import { PERMISSION_LABELS } from "../constants/organization.constants";
import type {
  AuditLogEntry,
  CreateOrganizationPayload,
  Organization,
  OrganizationActivityItem,
  OrganizationStats,
  TransferOwnershipPayload,
  UpdateBrandingPayload,
  UpdateOrganizationPayload,
} from "../types/organization.types";
import type {
  OrgRoleDefinition,
  PermissionMatrixState,
} from "../types/member.types";
import {
  OrganizationNotFoundError,
  OrganizationPermissionError,
  OrganizationValidationError,
} from "../utils/errors";
import {
  isOrganizationApiEnabled,
  organizationApiService,
} from "./organization-api.service";

const delay = (ms = 350) => new Promise((resolve) => setTimeout(resolve, ms));

function cloneOrg(org: Organization): Organization {
  return {
    ...org,
    branding: { ...org.branding },
  };
}

let organizations: Organization[] = [
  {
    id: "org_demo",
    name: "Acme Corporation",
    slug: "acme",
    description: "Enterprise engineering operations for Acme product teams.",
    industry: "technology",
    timezone: "America/New_York",
    language: "en",
    dateFormat: "MDY",
    logoUrl: undefined,
    branding: { primaryColor: "#2563EB", accentColor: "#0F172A" },
    memberCount: 12,
    activeProjectCount: 8,
    storageUsedGb: 42.5,
    storageLimitGb: 200,
    createdAt: "2024-03-12T10:00:00.000Z",
    myRole: "admin",
  },
  {
    id: "org_labs",
    name: "DevFlow Labs",
    slug: "devflow-labs",
    description: "Internal sandbox for DevFlow platform experiments.",
    industry: "technology",
    timezone: "UTC",
    language: "en",
    dateFormat: "YMD",
    branding: { primaryColor: "#0EA5E9", accentColor: "#082F49" },
    memberCount: 5,
    activeProjectCount: 3,
    storageUsedGb: 8.2,
    storageLimitGb: 50,
    createdAt: "2025-01-08T14:30:00.000Z",
    myRole: "owner",
  },
  {
    id: "org_startup",
    name: "Startup Team",
    slug: "startup-team",
    description: "Early-stage product squad collaborating on MVPs.",
    industry: "other",
    timezone: "Asia/Kolkata",
    language: "en",
    dateFormat: "DMY",
    branding: { primaryColor: "#16A34A", accentColor: "#14532D" },
    memberCount: 4,
    activeProjectCount: 2,
    storageUsedGb: 3.1,
    storageLimitGb: 25,
    createdAt: "2025-06-20T09:15:00.000Z",
    myRole: "developer",
  },
];

const activityByOrg: Record<string, OrganizationActivityItem[]> = {
  org_demo: [
    {
      id: "act_1",
      actorName: "Avery Chen",
      action: "invited",
      target: "jordan@acme.com",
      createdAt: "2026-07-30T16:20:00.000Z",
    },
    {
      id: "act_2",
      actorName: "Sam Rivera",
      action: "updated branding",
      target: "Acme Corporation",
      createdAt: "2026-07-28T11:05:00.000Z",
    },
    {
      id: "act_3",
      actorName: "Avery Chen",
      action: "created team",
      target: "Platform",
      createdAt: "2026-07-22T08:40:00.000Z",
    },
  ],
  org_labs: [
    {
      id: "act_4",
      actorName: "Avery Chen",
      action: "joined",
      target: "DevFlow Labs",
      createdAt: "2025-01-08T14:35:00.000Z",
    },
  ],
  org_startup: [],
};

const auditByOrg: Record<string, AuditLogEntry[]> = {
  org_demo: [
    {
      id: "aud_1",
      actorName: "Avery Chen",
      action: "member.invite",
      resource: "jordan@acme.com",
      ipAddress: "203.0.113.10",
      createdAt: "2026-07-30T16:20:00.000Z",
    },
    {
      id: "aud_2",
      actorName: "Sam Rivera",
      action: "organization.update",
      resource: "branding",
      ipAddress: "198.51.100.22",
      createdAt: "2026-07-28T11:05:00.000Z",
    },
  ],
  org_labs: [],
  org_startup: [],
};

function requireOrg(id: string): Organization {
  const org = organizations.find((item) => item.id === id);
  if (!org) throw new OrganizationNotFoundError();
  return org;
}

function buildRoleDefinitions(org: Organization): OrgRoleDefinition[] {
  return ROLES.map((role) => ({
    id: `role_${org.id}_${role}`,
    key: role,
    name: ROLE_LABELS[role],
    description: `${ROLE_LABELS[role]} access for ${org.name}`,
    isSystem: true,
    permissions: [...ROLE_PERMISSIONS[role]],
    userCount:
      role === org.myRole
        ? Math.max(1, Math.floor(org.memberCount / 4))
        : Math.max(0, Math.floor(org.memberCount / 5)),
  }));
}

function buildMatrix(orgId: string): PermissionMatrixState {
  const org = requireOrg(orgId);
  const roles = ROLES.map((role) => ({ key: role, name: ROLE_LABELS[role] }));
  const rows = PERMISSIONS.filter((p) => !p.startsWith("billing")).map((permission) => {
    const meta = PERMISSION_LABELS[permission] ?? {
      label: permission,
      group: "Other",
    };
    const roleFlags = Object.fromEntries(
      ROLES.map((role) => [role, ROLE_PERMISSIONS[role].includes(permission)])
    ) as Record<string, boolean>;
    return {
      permission,
      label: meta.label,
      group: meta.group,
      roles: roleFlags,
    };
  });
  void org;
  return { roles, rows };
}

let matrixOverrides: Record<string, PermissionMatrixState> = {};

const organizationServiceImpl = {
  async list(params?: { q?: string }): Promise<Organization[]> {
    await delay();
    const q = params?.q?.trim().toLowerCase();
    const list = organizations.map(cloneOrg);
    if (!q) return list;
    return list.filter(
      (org) =>
        org.name.toLowerCase().includes(q) ||
        org.slug.toLowerCase().includes(q) ||
        org.description.toLowerCase().includes(q)
    );
  },

  async getById(id: string): Promise<Organization> {
    await delay(280);
    return cloneOrg(requireOrg(id));
  },

  async create(payload: CreateOrganizationPayload): Promise<Organization> {
    await delay();
    const slug = payload.slug.trim().toLowerCase();
    if (organizations.some((org) => org.slug === slug)) {
      throw new OrganizationValidationError("This slug is already taken");
    }
    const org: Organization = {
      id: `org_${Date.now().toString(36)}`,
      name: payload.name.trim(),
      slug,
      description: payload.description?.trim() ?? "",
      industry: payload.industry,
      timezone: payload.timezone,
      language: "en",
      dateFormat: "MDY",
      logoUrl: payload.logoUrl || undefined,
      branding: {
        logoUrl: payload.logoUrl || undefined,
        primaryColor: "#2563EB",
        accentColor: "#0F172A",
      },
      memberCount: 1,
      activeProjectCount: 0,
      storageUsedGb: 0,
      storageLimitGb: 25,
      createdAt: new Date().toISOString(),
      myRole: "owner",
    };
    organizations = [org, ...organizations];
    activityByOrg[org.id] = [
      {
        id: `act_${org.id}`,
        actorName: "You",
        action: "created",
        target: org.name,
        createdAt: org.createdAt,
      },
    ];
    auditByOrg[org.id] = [];
    return cloneOrg(org);
  },

  async update(id: string, payload: UpdateOrganizationPayload): Promise<Organization> {
    await delay();
    const org = requireOrg(id);
    if (org.myRole === "viewer" || org.myRole === "developer") {
      throw new OrganizationPermissionError();
    }
    Object.assign(org, {
      ...payload,
      name: payload.name?.trim() ?? org.name,
      description: payload.description?.trim() ?? org.description,
    });
    return cloneOrg(org);
  },

  async updateBranding(id: string, payload: UpdateBrandingPayload): Promise<Organization> {
    await delay();
    const org = requireOrg(id);
    if (org.myRole === "viewer" || org.myRole === "developer") {
      throw new OrganizationPermissionError();
    }
    org.branding = {
      logoUrl: payload.logoUrl || undefined,
      primaryColor: payload.primaryColor,
      accentColor: payload.accentColor,
    };
    org.logoUrl = payload.logoUrl || undefined;
    return cloneOrg(org);
  },

  async getStats(id: string): Promise<OrganizationStats> {
    await delay(200);
    const org = requireOrg(id);
    return {
      totalMembers: org.memberCount,
      activeProjects: org.activeProjectCount,
      storageUsedGb: org.storageUsedGb,
      storageLimitGb: org.storageLimitGb,
      createdAt: org.createdAt,
    };
  },

  async getActivity(id: string): Promise<OrganizationActivityItem[]> {
    await delay(220);
    requireOrg(id);
    return [...(activityByOrg[id] ?? [])];
  },

  async getAuditLogs(id: string): Promise<AuditLogEntry[]> {
    await delay(250);
    requireOrg(id);
    return [...(auditByOrg[id] ?? [])];
  },

  async leave(id: string): Promise<void> {
    await delay();
    const org = requireOrg(id);
    if (org.myRole === "owner") {
      throw new OrganizationPermissionError("Owners must transfer ownership before leaving");
    }
    organizations = organizations.filter((item) => item.id !== id);
  },

  async transferOwnership(id: string, payload: TransferOwnershipPayload): Promise<Organization> {
    await delay();
    const org = requireOrg(id);
    if (org.myRole !== "owner") throw new OrganizationPermissionError();
    if (payload.confirmation !== "TRANSFER") {
      throw new OrganizationValidationError('Type TRANSFER to confirm');
    }
    if (!payload.memberId) throw new OrganizationValidationError("Select a member");
    org.myRole = "admin";
    return cloneOrg(org);
  },

  async delete(id: string, confirmationSlug: string): Promise<void> {
    await delay();
    const org = requireOrg(id);
    if (org.myRole !== "owner") throw new OrganizationPermissionError();
    if (confirmationSlug !== org.slug) {
      throw new OrganizationValidationError("Confirmation slug does not match");
    }
    organizations = organizations.filter((item) => item.id !== id);
    delete activityByOrg[id];
    delete auditByOrg[id];
    delete matrixOverrides[id];
  },

  async setMemberCount(id: string, count: number): Promise<void> {
    const org = requireOrg(id);
    org.memberCount = count;
  },

  async listRoles(orgId: string): Promise<OrgRoleDefinition[]> {
    await delay(240);
    return buildRoleDefinitions(requireOrg(orgId));
  },

  async getPermissionMatrix(orgId: string): Promise<PermissionMatrixState> {
    await delay(260);
    return matrixOverrides[orgId] ?? buildMatrix(orgId);
  },

  async savePermissionMatrix(
    orgId: string,
    matrix: PermissionMatrixState
  ): Promise<PermissionMatrixState> {
    await delay();
    const org = requireOrg(orgId);
    if (org.myRole !== "owner" && org.myRole !== "admin") {
      throw new OrganizationPermissionError();
    }
    matrixOverrides[orgId] = {
      roles: matrix.roles.map((role) => ({ ...role })),
      rows: matrix.rows.map((row) => ({
        ...row,
        roles: { ...row.roles },
      })),
    };
    return matrixOverrides[orgId];
  },

  async duplicateRole(orgId: string, roleKey: string): Promise<OrgRoleDefinition> {
    await delay();
    const roles = await this.listRoles(orgId);
    const source = roles.find((role) => role.key === roleKey);
    if (!source) throw new OrganizationNotFoundError("Role not found");
    return {
      ...source,
      id: `role_${orgId}_copy_${Date.now().toString(36)}`,
      key: `${source.key}-copy`,
      name: `${source.name} Copy`,
      isSystem: false,
      userCount: 0,
    };
  },

  /** Test helper — not for UI. */
  __reset() {
    matrixOverrides = {};
  },
};

const mockOrganizationService = organizationServiceImpl;

/** In-memory mock (default). Live when organization API flag / Gateway URL is set. */
export const organizationService = new Proxy(mockOrganizationService, {
  get(target, prop, receiver) {
    const api = isOrganizationApiEnabled() ? organizationApiService : target;
    const value = Reflect.get(api as object, prop, receiver);
    return typeof value === "function" ? value.bind(api) : value;
  },
});
