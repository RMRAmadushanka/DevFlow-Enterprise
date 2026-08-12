import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/api", async () => {
  const actual = await vi.importActual<typeof import("@/lib/api")>("@/lib/api");
  return {
    ...actual,
    projectApi: {
      getProjects: vi.fn(),
      getProject: vi.fn(),
      createProject: vi.fn(),
      updateProject: vi.fn(),
      archiveProject: vi.fn(),
      restoreProject: vi.fn(),
      deleteProject: vi.fn(),
      favoriteProject: vi.fn(),
      unfavoriteProject: vi.fn(),
      getProjectMembers: vi.fn(),
      getProjectActivity: vi.fn(),
      getProjectSettings: vi.fn(),
      updateProjectSettings: vi.fn(),
      getProjectTags: vi.fn(),
      createProjectTag: vi.fn(),
      deleteProjectTag: vi.fn(),
      transferProjectOwnership: vi.fn(),
      updateProjectStatus: vi.fn(),
      updateProjectHealth: vi.fn(),
    },
    userApi: {
      getById: vi.fn(),
    },
  };
});

import { projectApi, userApi } from "@/lib/api";
import { DEFAULT_PROJECT_FILTERS } from "../../constants/project.constants";
import { projectApiService } from "../project-api.service";

const sampleDetail = {
  id: "p1",
  organizationId: "org1",
  name: "Alpha",
  slug: "alpha",
  key: "ALP",
  description: "Desc",
  status: "ACTIVE" as const,
  health: "HEALTHY" as const,
  visibility: "PRIVATE" as const,
  memberCount: 1,
  favorite: false,
  tags: [{ id: "t1", name: "api", color: "#2563EB" }],
  createdBy: "u1",
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-01-02T00:00:00Z",
};

describe("projectApiService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(projectApi.getProjectMembers).mockResolvedValue({
      items: [
        {
          id: "m1",
          projectId: "p1",
          userId: "u1",
          role: "PROJECT_OWNER",
          status: "ACTIVE",
          joinedAt: "2026-01-01T00:00:00Z",
        },
      ],
      page: 0,
      pageSize: 100,
      totalElements: 1,
      totalPages: 1,
    });
    vi.mocked(projectApi.getProjectActivity).mockResolvedValue({
      items: [],
      page: 0,
      pageSize: 50,
      totalElements: 0,
      totalPages: 0,
    });
    vi.mocked(projectApi.getProjectSettings).mockResolvedValue({
      id: "s1",
      projectId: "p1",
      defaultVisibility: "PRIVATE",
      allowMemberInvites: true,
      allowGuestAccess: false,
      timezone: "Asia/Kolkata",
      defaultProjectView: "OVERVIEW",
    });
    vi.mocked(userApi.getById).mockResolvedValue({
      id: "u1",
      externalIdentityId: "sub",
      username: "owner",
      email: "owner@example.com",
      firstName: "Own",
      lastName: "Er",
      displayName: "Own Er",
      avatarUrl: null,
      timezone: "UTC",
      locale: "en",
      status: "ACTIVE",
      theme: "system",
      notifyEmail: true,
      notifyInApp: true,
      createdAt: "2026-01-01T00:00:00Z",
      updatedAt: "2026-01-01T00:00:00Z",
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("lists projects with backend query params", async () => {
    vi.mocked(projectApi.getProjects).mockResolvedValue({
      items: [sampleDetail],
      page: 0,
      pageSize: 50,
      totalElements: 1,
      totalPages: 1,
    });

    const result = await projectApiService.list({
      filters: { ...DEFAULT_PROJECT_FILTERS, q: "alp", organizationId: "org1" },
      sort: "name",
    });

    expect(projectApi.getProjects).toHaveBeenCalledWith(
      expect.objectContaining({
        organizationId: "org1",
        search: "alp",
        sort: "name,asc",
        page: 0,
        size: 50,
      })
    );
    expect(result.items[0]?.key).toBe("ALP");
    expect(result.total).toBe(1);
  });

  it("hydrates detail with members and settings timezone", async () => {
    vi.mocked(projectApi.getProject).mockResolvedValue(sampleDetail);

    const detail = await projectApiService.getById("p1");
    expect(detail.members).toHaveLength(1);
    expect(detail.members[0]?.role).toBe("owner");
    expect(detail.members[0]?.name).toBe("Own Er");
    expect(detail.timezone).toBe("Asia/Kolkata");
    expect(detail.tags).toContain("api");
  });

  it("archives and restores via dedicated endpoints", async () => {
    vi.mocked(projectApi.archiveProject).mockResolvedValue({ ...sampleDetail, status: "ARCHIVED" });
    vi.mocked(projectApi.restoreProject).mockResolvedValue(sampleDetail);
    vi.mocked(projectApi.getProject).mockResolvedValue(sampleDetail);

    await projectApiService.archive("p1");
    expect(projectApi.archiveProject).toHaveBeenCalledWith("p1");

    await projectApiService.restore("p1");
    expect(projectApi.restoreProject).toHaveBeenCalledWith("p1");
  });

  it("transfers ownership using member userId", async () => {
    vi.mocked(projectApi.transferProjectOwnership).mockResolvedValue(sampleDetail);
    vi.mocked(projectApi.getProject).mockResolvedValue(sampleDetail);

    await projectApiService.transferOwnership("p1", "u1", "TRANSFER");
    expect(projectApi.transferProjectOwnership).toHaveBeenCalledWith("p1", {
      newOwnerUserId: "u1",
    });
  });

  it("updates status and health via dedicated endpoints", async () => {
    vi.mocked(projectApi.updateProjectStatus).mockResolvedValue(sampleDetail);
    vi.mocked(projectApi.updateProjectHealth).mockResolvedValue(sampleDetail);
    vi.mocked(projectApi.getProject).mockResolvedValue(sampleDetail);

    await projectApiService.updateStatus("p1", "paused");
    expect(projectApi.updateProjectStatus).toHaveBeenCalledWith("p1", { status: "ON_HOLD" });

    await projectApiService.updateHealth("p1", "at_risk");
    expect(projectApi.updateProjectHealth).toHaveBeenCalledWith("p1", { health: "AT_RISK" });
  });
});
