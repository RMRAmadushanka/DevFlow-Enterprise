import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/api", async () => {
  const actual = await vi.importActual<typeof import("@/lib/api")>("@/lib/api");
  return {
    ...actual,
    userApi: {
      me: vi.fn(),
      getById: vi.fn(),
      getProfile: vi.fn(),
      updateProfile: vi.fn(),
      getPreferences: vi.fn(),
      updatePreferences: vi.fn(),
    },
    organizationApi: {
      listMembers: vi.fn(),
    },
  };
});

import { organizationApi, userApi } from "@/lib/api";
import { userApiService } from "../user-api.service";

describe("userApiService", () => {
  beforeEach(() => {
    vi.mocked(userApi.updateProfile).mockResolvedValue({
      id: "u1",
      externalIdentityId: "sub",
      username: "ada",
      email: "ada@example.com",
      firstName: "Ada",
      lastName: "Lovelace",
      displayName: "Ada Lovelace",
      timezone: "UTC",
      locale: "en",
      status: "ACTIVE",
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    });
    vi.mocked(userApi.getPreferences).mockResolvedValue({
      userId: "u1",
      theme: "system",
      notifyEmail: true,
      notifyInApp: true,
    });
    vi.mocked(userApi.updatePreferences).mockResolvedValue({
      userId: "u1",
      theme: "dark",
      notifyEmail: true,
      notifyInApp: false,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("updates profile via user API", async () => {
    const profile = await userApiService.updateProfile({
      firstName: "Ada",
      lastName: "Lovelace",
      timezone: "UTC",
    });
    expect(userApi.updateProfile).toHaveBeenCalled();
    expect(profile.name).toBe("Ada Lovelace");
  });

  it("searches org members by name using user service hydration", async () => {
    vi.mocked(organizationApi.listMembers).mockResolvedValue({
      items: [
        {
          id: "m1",
          organizationId: "org1",
          userId: "u1",
          roleCode: "MEMBER",
          status: "ACTIVE",
        },
      ],
      page: 0,
      pageSize: 100,
      totalElements: 1,
      totalPages: 1,
    });
    vi.mocked(userApi.getById).mockResolvedValue({
      id: "u1",
      externalIdentityId: "sub",
      username: "ada",
      email: "ada@example.com",
      firstName: "Ada",
      lastName: "Lovelace",
      displayName: "Ada Lovelace",
      status: "ACTIVE",
      notifyEmail: true,
      notifyInApp: true,
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    });

    const results = await userApiService.searchUsers({
      q: "ada",
      organizationId: "org1",
    });
    expect(results).toHaveLength(1);
    expect(results[0]?.id).toBe("u1");
  });

  it("looks up user by UUID", async () => {
    const id = "11111111-2222-3333-4444-555555555555";
    vi.mocked(userApi.getById).mockResolvedValue({
      id,
      externalIdentityId: "sub",
      username: "ada",
      email: "ada@example.com",
      firstName: "Ada",
      lastName: "Lovelace",
      status: "ACTIVE",
      notifyEmail: true,
      notifyInApp: true,
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    });
    const results = await userApiService.searchUsers({ q: id });
    expect(results[0]?.id).toBe(id);
  });
});
