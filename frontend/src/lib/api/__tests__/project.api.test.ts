import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { projectApi } from "../services/project.api";

describe("projectApi", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.stubGlobal("fetch", fetchMock);
    vi.stubEnv("NEXT_PUBLIC_API_URL", "http://gateway.test");
  });

  afterEach(() => {
    fetchMock.mockReset();
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it("getProjects issues GET /api/projects with query", async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          success: true,
          data: {
            items: [],
            page: 0,
            pageSize: 20,
            totalElements: 0,
            totalPages: 0,
          },
          error: null,
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      )
    );

    await projectApi.getProjects({ organizationId: "org-1", page: 0, size: 20 });

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toContain("/api/projects");
    expect(url).toContain("organizationId=org-1");
    expect(url).toContain("page=0");
    expect(url).toContain("size=20");
    expect(init.method).toBe("GET");
  });

  it("createProject posts JSON body", async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          success: true,
          data: {
            id: "p1",
            organizationId: "org-1",
            name: "N",
            slug: "n",
            key: "N",
            status: "ACTIVE",
            health: "UNKNOWN",
            visibility: "PRIVATE",
            memberCount: 1,
            favorite: false,
            createdAt: "2026-01-01T00:00:00Z",
            updatedAt: "2026-01-01T00:00:00Z",
          },
          error: null,
        }),
        { status: 201, headers: { "Content-Type": "application/json" } }
      )
    );

    await projectApi.createProject({
      organizationId: "org-1",
      name: "N",
      key: "N",
    });

    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(init.method).toBe("POST");
    expect(JSON.parse(String(init.body))).toMatchObject({
      organizationId: "org-1",
      name: "N",
      key: "N",
    });
  });

  it("favorite / unfavorite / archive / transfer use correct methods", async () => {
    const ok = (data: unknown = { ok: true }) =>
      new Response(JSON.stringify({ success: true, data, error: null }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });

    fetchMock
      .mockResolvedValueOnce(ok({ id: "f1", projectId: "p1", userId: "u1" }))
      .mockResolvedValueOnce(new Response(null, { status: 204 }))
      .mockResolvedValueOnce(
        ok({
          id: "p1",
          organizationId: "o",
          name: "N",
          slug: "n",
          key: "N",
          status: "ARCHIVED",
          health: "UNKNOWN",
          visibility: "PRIVATE",
          createdAt: "t",
          updatedAt: "t",
        })
      )
      .mockResolvedValueOnce(
        ok({
          id: "p1",
          organizationId: "o",
          name: "N",
          slug: "n",
          key: "N",
          status: "ACTIVE",
          health: "UNKNOWN",
          visibility: "PRIVATE",
          createdAt: "t",
          updatedAt: "t",
        })
      );

    await projectApi.favoriteProject("p1");
    await projectApi.unfavoriteProject("p1");
    await projectApi.archiveProject("p1");
    await projectApi.transferProjectOwnership("p1", { newOwnerUserId: "user-2" });

    expect((fetchMock.mock.calls[0] as [string, RequestInit])[1].method).toBe("POST");
    expect((fetchMock.mock.calls[0] as [string, RequestInit])[0]).toContain("/favorite");
    expect((fetchMock.mock.calls[1] as [string, RequestInit])[1].method).toBe("DELETE");
    expect((fetchMock.mock.calls[2] as [string, RequestInit])[0]).toContain("/archive");
    expect((fetchMock.mock.calls[3] as [string, RequestInit])[0]).toContain("/ownership/transfer");
  });
});
