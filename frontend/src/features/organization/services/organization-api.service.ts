/**
 * Live organization-service adapter.
 * Toggle: NEXT_PUBLIC_USE_ORGANIZATION_API (defaults ON when API base URL is set).
 */

import { ApiError, organizationApi, userApi } from "@/lib/api";
import type { Organization as ApiOrganization } from "@/lib/api/types/organization";

import type {
  CreateOrganizationPayload,
  Organization,
  OrganizationActivityItem,
  OrganizationStats,
  TransferOwnershipPayload,
  UpdateBrandingPayload,
  UpdateOrganizationPayload,
  AuditLogEntry,
} from "../types/organization.types";
import type {
  OrgRoleDefinition,
  PermissionMatrixState,
} from "../types/member.types";
import {
  OrganizationNotFoundError,
  OrganizationPermissionError,
  OrganizationValidationError,
  mapOrganizationApiError,
} from "../utils/errors";
import {
  buildLiveRoleDefinitions,
  expandOrgPermissionCodes,
  toCreateOrganizationRequest,
  toOrganizationStats,
  toUiOrgRole,
  toUiOrganization,
  toUiPermissionMatrix,
  toUpdateOrganizationRequest,
  toUpdatePermissionMatrixRequest,
} from "./organization-api.mappers";
import { memberApiService } from "./member-api.service";

function mapError(error: unknown): never {
  throw mapOrganizationApiError(error);
}

async function resolveMyRoleFromMembers(
  meId: string | null,
  members: { userId: string; roleCode: string }[]
): Promise<Organization["myRole"]> {
  if (!meId) return "developer";
  const mine = members.find((m) => m.userId === meId);
  return mine ? toUiOrgRole(mine.roleCode) : "developer";
}

let cachedMeId: string | null | undefined;

async function currentUserId(): Promise<string | null> {
  if (cachedMeId !== undefined) return cachedMeId;
  try {
    const me = await userApi.me();
    cachedMeId = me.id;
    return cachedMeId;
  } catch {
    cachedMeId = null;
    return null;
  }
}

async function hydrateOrganization(org: ApiOrganization): Promise<Organization> {
  try {
    const meId = await currentUserId();
    const page = await organizationApi.listMembers(org.id, { page: 0, size: 100 });
    const myRole = await resolveMyRoleFromMembers(meId, page.items);
    return toUiOrganization(org, { myRole, memberCount: page.totalElements });
  } catch {
    return toUiOrganization(org, { myRole: "developer", memberCount: 0 });
  }
}

export const organizationApiService = {
  async list(params?: { q?: string }): Promise<Organization[]> {
    try {
      const page = await organizationApi.list({ page: 0, size: 100 });
      const orgs = await Promise.all(page.items.map((org) => hydrateOrganization(org)));
      const q = params?.q?.trim().toLowerCase();
      if (!q) return orgs;
      return orgs.filter(
        (org) =>
          org.name.toLowerCase().includes(q) ||
          org.slug.toLowerCase().includes(q) ||
          org.description.toLowerCase().includes(q)
      );
    } catch (error) {
      mapError(error);
    }
  },

  async getById(id: string): Promise<Organization> {
    try {
      const org = await organizationApi.getById(id);
      return hydrateOrganization(org);
    } catch (error) {
      mapError(error);
    }
  },

  async create(payload: CreateOrganizationPayload): Promise<Organization> {
    try {
      const org = await organizationApi.create(toCreateOrganizationRequest(payload));
      return hydrateOrganization(org);
    } catch (error) {
      if (error instanceof ApiError && error.status === 409) {
        throw new OrganizationValidationError("This slug is already taken");
      }
      mapError(error);
    }
  },

  async update(id: string, payload: UpdateOrganizationPayload): Promise<Organization> {
    try {
      const org = await organizationApi.update(id, toUpdateOrganizationRequest(payload));
      return hydrateOrganization(org);
    } catch (error) {
      mapError(error);
    }
  },

  async updateBranding(id: string, payload: UpdateBrandingPayload): Promise<Organization> {
    try {
      const org = await organizationApi.update(id, {
        logoUrl: payload.logoUrl || null,
      });
      const ui = await hydrateOrganization(org);
      return {
        ...ui,
        branding: {
          logoUrl: payload.logoUrl || undefined,
          primaryColor: payload.primaryColor,
          accentColor: payload.accentColor,
        },
        logoUrl: payload.logoUrl || undefined,
      };
    } catch (error) {
      mapError(error);
    }
  },

  async getStats(id: string): Promise<OrganizationStats> {
    const org = await this.getById(id);
    return toOrganizationStats(org);
  },

  async getActivity(_id: string): Promise<OrganizationActivityItem[]> {
    return [];
  },

  async getAuditLogs(_id: string): Promise<AuditLogEntry[]> {
    return [];
  },

  async leave(id: string): Promise<void> {
    try {
      const me = await userApi.me();
      await organizationApi.removeMember(id, me.id);
    } catch (error) {
      mapError(error);
    }
  },

  async transferOwnership(
    id: string,
    payload: TransferOwnershipPayload
  ): Promise<Organization> {
    if (payload.confirmation !== "TRANSFER") {
      throw new OrganizationValidationError("Type TRANSFER to confirm");
    }
    if (!payload.memberId) {
      throw new OrganizationValidationError("Select a member");
    }
    try {
      const members = await memberApiService.listMembers(id);
      const target = members.find((m) => m.id === payload.memberId || m.userId === payload.memberId);
      if (!target) throw new OrganizationNotFoundError("Member not found");

      await organizationApi.updateMember(id, target.userId, { roleCode: "OWNER" });
      const previousOwners = members.filter(
        (m) => m.role === "owner" && m.userId !== target.userId
      );
      for (const owner of previousOwners) {
        await organizationApi.updateMember(id, owner.userId, { roleCode: "ADMIN" });
      }
      return this.getById(id);
    } catch (error) {
      if (
        error instanceof OrganizationNotFoundError ||
        error instanceof OrganizationValidationError
      ) {
        throw error;
      }
      mapError(error);
    }
  },

  async delete(id: string, confirmationSlug: string): Promise<void> {
    try {
      const org = await this.getById(id);
      if (confirmationSlug !== org.slug) {
        throw new OrganizationValidationError("Confirmation slug does not match");
      }
      await organizationApi.remove(id);
    } catch (error) {
      if (error instanceof OrganizationValidationError) throw error;
      mapError(error);
    }
  },

  async setMemberCount(_id: string, _count: number): Promise<void> {
    /* no-op on live API — counts come from membership list */
  },

  async listRoles(orgId: string): Promise<OrgRoleDefinition[]> {
    const [org, members, matrix] = await Promise.all([
      this.getById(orgId),
      memberApiService.listMembers(orgId),
      this.getPermissionMatrix(orgId),
    ]);
    return buildLiveRoleDefinitions(org, members, matrix);
  },

  async getPermissionMatrix(orgId: string): Promise<PermissionMatrixState> {
    try {
      const matrix = await organizationApi.getPermissionMatrix(orgId);
      return toUiPermissionMatrix(matrix);
    } catch (error) {
      mapError(error);
    }
  },

  async savePermissionMatrix(
    orgId: string,
    matrix: PermissionMatrixState
  ): Promise<PermissionMatrixState> {
    try {
      const saved = await organizationApi.savePermissionMatrix(
        orgId,
        toUpdatePermissionMatrixRequest(matrix)
      );
      return toUiPermissionMatrix(saved);
    } catch (error) {
      mapError(error);
    }
  },

  async listMemberPermissions(orgId: string, userId: string): Promise<string[]> {
    try {
      const permissions = await organizationApi.listMemberPermissions(orgId, userId);
      return expandOrgPermissionCodes(permissions.map((permission) => permission.code));
    } catch (error) {
      mapError(error);
    }
  },

  async duplicateRole(_orgId: string, _roleKey: string): Promise<OrgRoleDefinition> {
    throw new OrganizationPermissionError(
      "Custom roles are not supported by the organization service yet"
    );
  },
};

import { resolveLiveApiFlag } from "@/lib/api/live-api";

export function isOrganizationApiEnabled(): boolean {
  return resolveLiveApiFlag(process.env.NEXT_PUBLIC_USE_ORGANIZATION_API);
}
