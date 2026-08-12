import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/api", async () => {
  const actual = await vi.importActual<typeof import("@/lib/api")>("@/lib/api");
  return {
    ...actual,
    organizationApi: {
      list: vi.fn(),
      getById: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      remove: vi.fn(),
      listMembers: vi.fn(),
      updateMember: vi.fn(),
      removeMember: vi.fn(),
      listInvitations: vi.fn(),
      createInvitation: vi.fn(),
      revokeInvitation: vi.fn(),
      listTeams: vi.fn(),
      createTeam: vi.fn(),
      updateTeam: vi.fn(),
      deleteTeam: vi.fn(),
      listTeamMembers: vi.fn(),
      addTeamMember: vi.fn(),
      removeTeamMember: vi.fn(),
    },
    userApi: {
      me: vi.fn(),
      getById: vi.fn(),
    },
  };
});

import { organizationApi, userApi } from "@/lib/api";
import { organizationApiService } from "../organization-api.service";
import { memberApiService } from "../member-api.service";

const sampleOrg = {
  id: "org1",
  name: "Acme",
  slug: "acme",
  description: "Engineering",
  logoUrl: null,
  status: "ACTIVE" as const,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

describe("organizationApiService", () => {
  beforeEach(() => {
    vi.mocked(userApi.me).mockResolvedValue({
      id: "u-me",
      externalIdentityId: "sub",
      username: "me",
      email: "me@acme.com",
      status: "ACTIVE",
      notifyEmail: true,
      notifyInApp: true,
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    });
    vi.mocked(organizationApi.listMembers).mockResolvedValue({
      items: [
        {
          id: "mem1",
          organizationId: "org1",
          userId: "u-me",
          roleCode: "OWNER",
          status: "ACTIVE",
        },
      ],
      page: 0,
      pageSize: 100,
      totalElements: 1,
      totalPages: 1,
    });
    vi.mocked(userApi.getById).mockResolvedValue({
      id: "u-me",
      externalIdentityId: "sub",
      username: "me",
      email: "me@acme.com",
      firstName: "Me",
      lastName: "User",
      displayName: "Me User",
      status: "ACTIVE",
      notifyEmail: true,
      notifyInApp: true,
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("lists organizations and hydrates myRole", async () => {
    vi.mocked(organizationApi.list).mockResolvedValue({
      items: [sampleOrg],
      page: 0,
      pageSize: 100,
      totalElements: 1,
      totalPages: 1,
    });

    const result = await organizationApiService.list();
    expect(result).toHaveLength(1);
    expect(result[0]?.myRole).toBe("owner");
    expect(result[0]?.memberCount).toBe(1);
  });

  it("creates organization via API", async () => {
    vi.mocked(organizationApi.create).mockResolvedValue(sampleOrg);
    const org = await organizationApiService.create({
      name: "Acme",
      slug: "acme",
      description: "Engineering",
      industry: "technology",
      timezone: "UTC",
    });
    expect(organizationApi.create).toHaveBeenCalled();
    expect(org.slug).toBe("acme");
  });

  it("lists members hydrated from user service", async () => {
    const members = await memberApiService.listMembers("org1");
    expect(members).toHaveLength(1);
    expect(members[0]?.name).toBe("Me User");
    expect(members[0]?.role).toBe("owner");
  });

  it("invites by email", async () => {
    vi.mocked(organizationApi.createInvitation).mockResolvedValue({
      id: "inv1",
      organizationId: "org1",
      email: "new@acme.com",
      roleCode: "MEMBER",
      status: "PENDING",
      expiresAt: "2026-08-20T00:00:00.000Z",
      createdAt: "2026-08-06T00:00:00.000Z",
    });
    const invite = await memberApiService.invite("org1", {
      email: "new@acme.com",
      role: "developer",
    });
    expect(invite.email).toBe("new@acme.com");
    expect(organizationApi.createInvitation).toHaveBeenCalledWith("org1", {
      email: "new@acme.com",
      roleCode: "MEMBER",
      expiresInDays: 14,
    });
  });
});
