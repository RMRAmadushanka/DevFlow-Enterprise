/**
 * Live organization members / invitations / teams adapter.
 */

import { ApiError, organizationApi, userApi } from "@/lib/api";
import type { User } from "@/lib/api/types/user";

import type {
  ChangeMemberRolePayload,
  CreateTeamPayload,
  Invitation,
  InviteMemberPayload,
  OrganizationMember,
  Team,
  UpdateTeamPayload,
} from "../types/member.types";
import {
  InvitationError,
  OrganizationNotFoundError,
  OrganizationPermissionError,
  OrganizationValidationError,
  mapOrganizationApiError,
} from "../utils/errors";
import {
  slugifyTeamName,
  toBackendOrgRole,
  toUiInvitation,
  toUiMember,
  toUiTeam,
} from "./organization-api.mappers";

function mapError(error: unknown): never {
  throw mapOrganizationApiError(error);
}

async function safeGetUser(userId: string): Promise<User | null> {
  try {
    return await userApi.getById(userId);
  } catch {
    return null;
  }
}

async function assertOrg(orgId: string): Promise<void> {
  try {
    await organizationApi.getById(orgId);
  } catch (error) {
    mapError(error);
  }
}

export const memberApiService = {
  async listMembers(orgId: string): Promise<OrganizationMember[]> {
    try {
      const page = await organizationApi.listMembers(orgId, { page: 0, size: 100 });
      const users = await Promise.all(
        page.items.map(async (membership) => ({
          membership,
          user: await safeGetUser(membership.userId),
        }))
      );
      return users.map(({ membership, user }) => toUiMember(membership, user));
    } catch (error) {
      mapError(error);
    }
  },

  async changeRole(
    orgId: string,
    payload: ChangeMemberRolePayload
  ): Promise<OrganizationMember> {
    try {
      const members = await this.listMembers(orgId);
      const member = members.find((m) => m.id === payload.memberId);
      if (!member) throw new OrganizationNotFoundError("Member not found");
      if (member.role === "owner") {
        throw new OrganizationPermissionError(
          "Cannot change the owner role here — use transfer ownership"
        );
      }
      const updated = await organizationApi.updateMember(orgId, member.userId, {
        roleCode: toBackendOrgRole(payload.role),
      });
      const user = await safeGetUser(updated.userId);
      return toUiMember(updated, user);
    } catch (error) {
      if (
        error instanceof OrganizationNotFoundError ||
        error instanceof OrganizationPermissionError
      ) {
        throw error;
      }
      mapError(error);
    }
  },

  async removeMember(orgId: string, memberId: string): Promise<void> {
    try {
      const members = await this.listMembers(orgId);
      const member = members.find((m) => m.id === memberId);
      if (!member) throw new OrganizationNotFoundError("Member not found");
      if (member.role === "owner") {
        throw new OrganizationPermissionError("Cannot remove the organization owner");
      }
      await organizationApi.removeMember(orgId, member.userId);
    } catch (error) {
      if (
        error instanceof OrganizationNotFoundError ||
        error instanceof OrganizationPermissionError
      ) {
        throw error;
      }
      mapError(error);
    }
  },

  async listInvitations(orgId: string): Promise<Invitation[]> {
    try {
      await assertOrg(orgId);
      const page = await organizationApi.listInvitations(orgId, { page: 0, size: 100 });
      return page.items.map(toUiInvitation);
    } catch (error) {
      mapError(error);
    }
  },

  async invite(orgId: string, payload: InviteMemberPayload): Promise<Invitation> {
    const email = payload.email.trim().toLowerCase();
    if (!email.includes("@")) throw new InvitationError("Enter a valid email");
    try {
      const invitation = await organizationApi.createInvitation(orgId, {
        email,
        roleCode: toBackendOrgRole(payload.role),
        expiresInDays: 14,
      });
      return toUiInvitation(invitation);
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 409) {
          throw new InvitationError("This person is already a member or has a pending invite");
        }
        if (error.status === 422 || error.status === 400) {
          throw new InvitationError(error.message);
        }
      }
      mapError(error);
    }
  },

  async resendInvitation(orgId: string, invitationId: string): Promise<Invitation> {
    try {
      const invitations = await this.listInvitations(orgId);
      const existing = invitations.find((item) => item.id === invitationId);
      if (!existing) throw new OrganizationNotFoundError("Invitation not found");
      if (existing.status !== "pending") {
        throw new InvitationError("Only pending invitations can be resent");
      }
      try {
        await organizationApi.revokeInvitation(invitationId);
      } catch {
        /* continue with recreate */
      }
      return this.invite(orgId, {
        email: existing.email,
        role: existing.role,
      });
    } catch (error) {
      if (
        error instanceof OrganizationNotFoundError ||
        error instanceof InvitationError
      ) {
        throw error;
      }
      mapError(error);
    }
  },

  async listTeams(orgId: string): Promise<Team[]> {
    try {
      await assertOrg(orgId);
      const page = await organizationApi.listTeams(orgId, { page: 0, size: 100 });
      const teams = await Promise.all(
        page.items.map(async (team) => {
          try {
            const members = await organizationApi.listTeamMembers(team.id, {
              page: 0,
              size: 100,
            });
            return toUiTeam(
              team,
              members.items.map((m) => m.userId)
            );
          } catch {
            return toUiTeam(team, []);
          }
        })
      );
      return teams;
    } catch (error) {
      mapError(error);
    }
  },

  async createTeam(orgId: string, payload: CreateTeamPayload): Promise<Team> {
    const name = payload.name.trim();
    if (name.length < 2) throw new OrganizationValidationError("Team name is required");
    try {
      const team = await organizationApi.createTeam(orgId, {
        name,
        slug: slugifyTeamName(name),
        description: payload.description?.trim() || null,
      });
      const memberIds = payload.memberIds ?? [];
      for (const userId of memberIds) {
        try {
          await organizationApi.addTeamMember(team.id, {
            userId,
            role: "TEAM_MEMBER",
          });
        } catch {
          /* skip invalid user ids */
        }
      }
      return toUiTeam(team, memberIds);
    } catch (error) {
      if (error instanceof ApiError && error.status === 409) {
        throw new OrganizationValidationError("A team with this name already exists");
      }
      mapError(error);
    }
  },

  async updateTeam(
    orgId: string,
    teamId: string,
    payload: UpdateTeamPayload
  ): Promise<Team> {
    try {
      const team = await organizationApi.updateTeam(teamId, {
        name: payload.name?.trim(),
        description: payload.description?.trim(),
        slug: payload.name ? slugifyTeamName(payload.name) : undefined,
      });

      if (payload.memberIds) {
        const current = await organizationApi.listTeamMembers(teamId, {
          page: 0,
          size: 100,
        });
        const currentIds = new Set(current.items.map((m) => m.userId));
        const nextIds = new Set(payload.memberIds);

        for (const userId of nextIds) {
          if (!currentIds.has(userId)) {
            await organizationApi.addTeamMember(teamId, {
              userId,
              role: "TEAM_MEMBER",
            });
          }
        }
        for (const userId of currentIds) {
          if (!nextIds.has(userId)) {
            await organizationApi.removeTeamMember(teamId, userId);
          }
        }
      }

      void orgId;
      return toUiTeam(team, payload.memberIds ?? []);
    } catch (error) {
      mapError(error);
    }
  },

  async deleteTeam(orgId: string, teamId: string): Promise<void> {
    try {
      void orgId;
      await organizationApi.deleteTeam(teamId);
    } catch (error) {
      mapError(error);
    }
  },

  async assignMembers(orgId: string, teamId: string, memberIds: string[]): Promise<Team> {
    return this.updateTeam(orgId, teamId, { memberIds });
  },
};
