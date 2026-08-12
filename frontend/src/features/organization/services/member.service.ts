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
} from "../utils/errors";
import { organizationService } from "./organization.service";
import { isOrganizationApiEnabled } from "./organization-api.service";
import { memberApiService } from "./member-api.service";

const delay = (ms = 320) => new Promise((resolve) => setTimeout(resolve, ms));

let members: OrganizationMember[] = [
  {
    id: "mem_1",
    organizationId: "org_demo",
    userId: "1",
    name: "Avery Chen",
    email: "demo@devflow.app",
    role: "admin",
    status: "active",
    teamIds: ["team_platform"],
    joinedAt: "2024-03-12T10:05:00.000Z",
  },
  {
    id: "mem_2",
    organizationId: "org_demo",
    userId: "u_sam",
    name: "Sam Rivera",
    email: "sam@acme.com",
    role: "manager",
    status: "active",
    teamIds: ["team_platform", "team_design"],
    joinedAt: "2024-04-02T12:00:00.000Z",
  },
  {
    id: "mem_3",
    organizationId: "org_demo",
    userId: "u_jordan",
    name: "Jordan Lee",
    email: "jordan@acme.com",
    role: "developer",
    status: "invited",
    teamIds: [],
    joinedAt: "2026-07-30T16:20:00.000Z",
  },
  {
    id: "mem_4",
    organizationId: "org_demo",
    userId: "u_casey",
    name: "Casey Ng",
    email: "casey@acme.com",
    role: "viewer",
    status: "active",
    teamIds: ["team_design"],
    joinedAt: "2025-11-18T09:00:00.000Z",
  },
  {
    id: "mem_5",
    organizationId: "org_labs",
    userId: "1",
    name: "Avery Chen",
    email: "demo@devflow.app",
    role: "owner",
    status: "active",
    teamIds: ["team_core"],
    joinedAt: "2025-01-08T14:35:00.000Z",
  },
  {
    id: "mem_6",
    organizationId: "org_startup",
    userId: "1",
    name: "Avery Chen",
    email: "demo@devflow.app",
    role: "developer",
    status: "active",
    teamIds: [],
    joinedAt: "2025-06-21T10:00:00.000Z",
  },
];

let invitations: Invitation[] = [
  {
    id: "inv_1",
    organizationId: "org_demo",
    email: "jordan@acme.com",
    role: "developer",
    teamId: "team_platform",
    message: "Welcome to the platform team",
    status: "pending",
    invitedBy: "Avery Chen",
    createdAt: "2026-07-30T16:20:00.000Z",
    expiresAt: "2026-08-13T16:20:00.000Z",
  },
];

let teams: Team[] = [
  {
    id: "team_platform",
    organizationId: "org_demo",
    name: "Platform",
    description: "Core platform engineers",
    memberIds: ["mem_1", "mem_2"],
    createdAt: "2024-05-01T00:00:00.000Z",
  },
  {
    id: "team_design",
    organizationId: "org_demo",
    name: "Design Systems",
    description: "Product design and design systems",
    memberIds: ["mem_2", "mem_4"],
    createdAt: "2024-08-15T00:00:00.000Z",
  },
  {
    id: "team_core",
    organizationId: "org_labs",
    name: "Core",
    description: "Labs core contributors",
    memberIds: ["mem_5"],
    createdAt: "2025-01-09T00:00:00.000Z",
  },
];

async function assertOrg(orgId: string) {
  await organizationService.getById(orgId);
}

async function syncMemberCount(orgId: string) {
  const count = members.filter(
    (m) => m.organizationId === orgId && m.status !== "suspended"
  ).length;
  await organizationService.setMemberCount(orgId, count);
}

const memberServiceImpl = {
  async listMembers(orgId: string): Promise<OrganizationMember[]> {
    await delay();
    await assertOrg(orgId);
    return members
      .filter((member) => member.organizationId === orgId)
      .map((member) => ({ ...member, teamIds: [...member.teamIds] }));
  },

  async changeRole(orgId: string, payload: ChangeMemberRolePayload): Promise<OrganizationMember> {
    await delay();
    await assertOrg(orgId);
    const member = members.find((item) => item.id === payload.memberId && item.organizationId === orgId);
    if (!member) throw new OrganizationNotFoundError("Member not found");
    if (member.role === "owner") {
      throw new OrganizationPermissionError("Cannot change the owner role here — use transfer ownership");
    }
    member.role = payload.role;
    return { ...member, teamIds: [...member.teamIds] };
  },

  async removeMember(orgId: string, memberId: string): Promise<void> {
    await delay();
    await assertOrg(orgId);
    const member = members.find((item) => item.id === memberId && item.organizationId === orgId);
    if (!member) throw new OrganizationNotFoundError("Member not found");
    if (member.role === "owner") {
      throw new OrganizationPermissionError("Cannot remove the organization owner");
    }
    members = members.filter((item) => item.id !== memberId);
    teams = teams.map((team) =>
      team.organizationId === orgId
        ? { ...team, memberIds: team.memberIds.filter((id) => id !== memberId) }
        : team
    );
    await syncMemberCount(orgId);
  },

  async listInvitations(orgId: string): Promise<Invitation[]> {
    await delay(240);
    await assertOrg(orgId);
    return invitations
      .filter((invite) => invite.organizationId === orgId)
      .map((invite) => ({ ...invite }));
  },

  async invite(orgId: string, payload: InviteMemberPayload): Promise<Invitation> {
    await delay();
    await assertOrg(orgId);
    const email = payload.email.trim().toLowerCase();
    if (!email.includes("@")) throw new InvitationError("Enter a valid email");
    if (members.some((m) => m.organizationId === orgId && m.email.toLowerCase() === email && m.status === "active")) {
      throw new InvitationError("This person is already a member");
    }
    if (invitations.some((i) => i.organizationId === orgId && i.email === email && i.status === "pending")) {
      throw new InvitationError("An invitation is already pending for this email");
    }

    const invitation: Invitation = {
      id: `inv_${Date.now().toString(36)}`,
      organizationId: orgId,
      email,
      role: payload.role,
      teamId: payload.teamId || undefined,
      message: payload.message?.trim() || undefined,
      status: "pending",
      invitedBy: "You",
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    };
    invitations = [invitation, ...invitations];

    members = [
      ...members,
      {
        id: `mem_${Date.now().toString(36)}`,
        organizationId: orgId,
        userId: `pending_${Date.now().toString(36)}`,
        name: email.split("@")[0] ?? email,
        email,
        role: payload.role,
        status: "invited",
        teamIds: payload.teamId ? [payload.teamId] : [],
        joinedAt: invitation.createdAt,
      },
    ];
    await syncMemberCount(orgId);
    return { ...invitation };
  },

  async resendInvitation(orgId: string, invitationId: string): Promise<Invitation> {
    await delay();
    const invitation = invitations.find(
      (item) => item.id === invitationId && item.organizationId === orgId
    );
    if (!invitation) throw new OrganizationNotFoundError("Invitation not found");
    if (invitation.status !== "pending") {
      throw new InvitationError("Only pending invitations can be resent");
    }
    invitation.createdAt = new Date().toISOString();
    invitation.expiresAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();
    return { ...invitation };
  },

  async listTeams(orgId: string): Promise<Team[]> {
    await delay();
    await assertOrg(orgId);
    return teams
      .filter((team) => team.organizationId === orgId)
      .map((team) => ({ ...team, memberIds: [...team.memberIds] }));
  },

  async createTeam(orgId: string, payload: CreateTeamPayload): Promise<Team> {
    await delay();
    await assertOrg(orgId);
    const name = payload.name.trim();
    if (name.length < 2) throw new OrganizationValidationError("Team name is required");
    if (teams.some((team) => team.organizationId === orgId && team.name.toLowerCase() === name.toLowerCase())) {
      throw new OrganizationValidationError("A team with this name already exists");
    }
    const team: Team = {
      id: `team_${Date.now().toString(36)}`,
      organizationId: orgId,
      name,
      description: payload.description?.trim() ?? "",
      memberIds: payload.memberIds ?? [],
      createdAt: new Date().toISOString(),
    };
    teams = [team, ...teams];
    return { ...team, memberIds: [...team.memberIds] };
  },

  async updateTeam(orgId: string, teamId: string, payload: UpdateTeamPayload): Promise<Team> {
    await delay();
    const team = teams.find((item) => item.id === teamId && item.organizationId === orgId);
    if (!team) throw new OrganizationNotFoundError("Team not found");
    if (payload.name) team.name = payload.name.trim();
    if (payload.description !== undefined) team.description = payload.description.trim();
    if (payload.memberIds) team.memberIds = [...payload.memberIds];
    return { ...team, memberIds: [...team.memberIds] };
  },

  async deleteTeam(orgId: string, teamId: string): Promise<void> {
    await delay();
    const exists = teams.some((team) => team.id === teamId && team.organizationId === orgId);
    if (!exists) throw new OrganizationNotFoundError("Team not found");
    teams = teams.filter((team) => !(team.id === teamId && team.organizationId === orgId));
    members = members.map((member) =>
      member.organizationId === orgId
        ? { ...member, teamIds: member.teamIds.filter((id) => id !== teamId) }
        : member
    );
  },

  async assignMembers(orgId: string, teamId: string, memberIds: string[]): Promise<Team> {
    return this.updateTeam(orgId, teamId, { memberIds });
  },
};

export const memberService = new Proxy(memberServiceImpl, {
  get(target, prop, receiver) {
    const api = isOrganizationApiEnabled() ? memberApiService : target;
    const value = Reflect.get(api as object, prop, receiver);
    return typeof value === "function" ? value.bind(api) : value;
  },
});
