import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { registerClientSessionProvider } from "@/lib/auth";
import { apiClient } from "../client";
import { resetUnauthorizedHandlerForTests, setUnauthorizedHandler } from "../interceptors/unauthorized";

const refreshAccessToken = vi.fn();

vi.mock("@/lib/auth/keycloak", () => ({
  isOidcEnabled: () => true,
  isKeycloakEnabled: () => true,
  refreshAccessToken: (...args: unknown[]) => refreshAccessToken(...args),
}));

describe("apiClient refresh retry", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.stubGlobal("fetch", fetchMock);
    resetUnauthorizedHandlerForTests();
    registerClientSessionProvider(() => ({
      user: { id: "u1", email: "a@b.c", name: "A", role: "developer" },
      organizationId: "o1",
      permissions: [],
      accessToken: "old-token",
    }));
    vi.stubEnv("NEXT_PUBLIC_API_URL", "http://gateway.test");
    refreshAccessToken.mockReset();
  });

  afterEach(() => {
    fetchMock.mockReset();
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
    resetUnauthorizedHandlerForTests();
    registerClientSessionProvider(null);
  });

  it("refreshes once and retries on 401", async () => {
    refreshAccessToken.mockResolvedValue({ accessToken: "new-token" });
    const on401 = vi.fn();
    setUnauthorizedHandler(on401);

    fetchMock
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            success: false,
            data: null,
            error: { code: "UNAUTHORIZED", message: "Expired" },
          }),
          { status: 401, headers: { "Content-Type": "application/json" } }
        )
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ success: true, data: { ok: true }, error: null }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        })
      );

    const result = await apiClient<{ ok: boolean }>("/api/users/me");
    expect(result).toEqual({ ok: true });
    expect(refreshAccessToken).toHaveBeenCalledOnce();
    expect(fetchMock).toHaveBeenCalledTimes(2);
    const retryHeaders = (fetchMock.mock.calls[1] as [string, RequestInit])[1].headers as Record<
      string,
      string
    >;
    expect(retryHeaders.Authorization).toBe("Bearer new-token");
    expect(on401).not.toHaveBeenCalled();
  });

  it("logs out when refresh fails", async () => {
    refreshAccessToken.mockResolvedValue(null);
    const on401 = vi.fn();
    setUnauthorizedHandler(on401);

    fetchMock.mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          success: false,
          data: null,
          error: { code: "UNAUTHORIZED", message: "Expired" },
        }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      )
    );

    await expect(apiClient("/api/users/me")).rejects.toMatchObject({ status: 401 });
    expect(on401).toHaveBeenCalledOnce();
  });
});
