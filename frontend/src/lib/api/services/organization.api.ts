import { apiClient } from "../client";
import type {
  AddMemberRequest,
  AddTeamMemberRequest,
  CreateInvitationRequest,
  CreateOrganizationRequest,
  CreateTeamRequest,
  Invitation,
  Membership,
  Organization,
  OrganizationListQuery,
  OrganizationPage,
  PermissionDefinition,
  PermissionMatrix,
  Team,
  TeamMembership,
  UpdateMemberRequest,
  UpdateOrganizationRequest,
  UpdatePermissionMatrixRequest,
  UpdateTeamRequest,
} from "../types/organization";

/** Typed Gateway client for organization-service. */
export const organizationApi = {
  list(query?: OrganizationListQuery): Promise<OrganizationPage<Organization>> {
    return apiClient<OrganizationPage<Organization>>("/api/organizations", {
      query: query
        ? { page: query.page, size: query.size, sort: query.sort }
        : undefined,
    });
  },

  create(body: CreateOrganizationRequest): Promise<Organization> {
    return apiClient<Organization>("/api/organizations", { method: "POST", body });
  },

  getById(organizationId: string): Promise<Organization> {
    return apiClient<Organization>(`/api/organizations/${organizationId}`);
  },

  update(organizationId: string, body: UpdateOrganizationRequest): Promise<Organization> {
    return apiClient<Organization>(`/api/organizations/${organizationId}`, {
      method: "PATCH",
      body,
    });
  },

  remove(organizationId: string): Promise<Organization> {
    return apiClient<Organization>(`/api/organizations/${organizationId}`, {
      method: "DELETE",
    });
  },

  listMembers(
    organizationId: string,
    query?: { page?: number; size?: number }
  ): Promise<OrganizationPage<Membership>> {
    return apiClient<OrganizationPage<Membership>>(
      `/api/organizations/${organizationId}/members`,
      { query }
    );
  },

  addMember(organizationId: string, body: AddMemberRequest): Promise<Membership> {
    return apiClient<Membership>(`/api/organizations/${organizationId}/members`, {
      method: "POST",
      body,
    });
  },

  updateMember(
    organizationId: string,
    userId: string,
    body: UpdateMemberRequest
  ): Promise<Membership> {
    return apiClient<Membership>(
      `/api/organizations/${organizationId}/members/${userId}`,
      { method: "PATCH", body }
    );
  },

  removeMember(organizationId: string, userId: string): Promise<void> {
    return apiClient<void>(`/api/organizations/${organizationId}/members/${userId}`, {
      method: "DELETE",
    });
  },

  listInvitations(
    organizationId: string,
    query?: { page?: number; size?: number }
  ): Promise<OrganizationPage<Invitation>> {
    return apiClient<OrganizationPage<Invitation>>(
      `/api/organizations/${organizationId}/invitations`,
      { query }
    );
  },

  createInvitation(
    organizationId: string,
    body: CreateInvitationRequest
  ): Promise<Invitation> {
    return apiClient<Invitation>(`/api/organizations/${organizationId}/invitations`, {
      method: "POST",
      body,
    });
  },

  revokeInvitation(invitationId: string): Promise<void> {
    return apiClient<void>(`/api/invitations/${invitationId}`, { method: "DELETE" });
  },

  acceptInvitation(token: string): Promise<Membership> {
    return apiClient<Membership>(`/api/invitations/${encodeURIComponent(token)}/accept`, {
      method: "POST",
    });
  },

  listTeams(
    organizationId: string,
    query?: { page?: number; size?: number }
  ): Promise<OrganizationPage<Team>> {
    return apiClient<OrganizationPage<Team>>(`/api/organizations/${organizationId}/teams`, {
      query,
    });
  },

  createTeam(organizationId: string, body: CreateTeamRequest): Promise<Team> {
    return apiClient<Team>(`/api/organizations/${organizationId}/teams`, {
      method: "POST",
      body,
    });
  },

  getTeam(teamId: string): Promise<Team> {
    return apiClient<Team>(`/api/teams/${teamId}`);
  },

  updateTeam(teamId: string, body: UpdateTeamRequest): Promise<Team> {
    return apiClient<Team>(`/api/teams/${teamId}`, { method: "PATCH", body });
  },

  deleteTeam(teamId: string): Promise<void> {
    return apiClient<void>(`/api/teams/${teamId}`, { method: "DELETE" });
  },

  listTeamMembers(
    teamId: string,
    query?: { page?: number; size?: number }
  ): Promise<OrganizationPage<TeamMembership>> {
    return apiClient<OrganizationPage<TeamMembership>>(`/api/teams/${teamId}/members`, {
      query,
    });
  },

  addTeamMember(teamId: string, body: AddTeamMemberRequest): Promise<TeamMembership> {
    return apiClient<TeamMembership>(`/api/teams/${teamId}/members`, {
      method: "POST",
      body,
    });
  },

  removeTeamMember(teamId: string, userId: string): Promise<void> {
    return apiClient<void>(`/api/teams/${teamId}/members/${userId}`, { method: "DELETE" });
  },

  getPermissionMatrix(organizationId: string): Promise<PermissionMatrix> {
    return apiClient<PermissionMatrix>(
      `/api/organizations/${organizationId}/permission-matrix`
    );
  },

  savePermissionMatrix(
    organizationId: string,
    body: UpdatePermissionMatrixRequest
  ): Promise<PermissionMatrix> {
    return apiClient<PermissionMatrix>(
      `/api/organizations/${organizationId}/permission-matrix`,
      { method: "PUT", body }
    );
  },

  listMemberPermissions(
    organizationId: string,
    userId: string
  ): Promise<PermissionDefinition[]> {
    return apiClient<PermissionDefinition[]>(
      `/api/organizations/${organizationId}/members/${userId}/permissions`
    );
  },
};
