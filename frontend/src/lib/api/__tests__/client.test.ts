import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { registerClientSessionProvider } from "@/lib/auth";
import { apiClient } from "../client";
import { CORRELATION_ID_HEADER } from "../config";
import { ApiError, AuthorizationError, isAuthorizationError } from "../errors";
import {
  resetUnauthorizedHandlerForTests,
  setUnauthorizedHandler,
} from "../interceptors/unauthorized";

function jsonResponse(body: unknown, init: ResponseInit = {}): Response {
  return new Response(JSON.stringify(body), {
    status: init.status ?? 200,
    headers: {
      "Content-Type": "application/json",
      ...(init.headers as Record<string, string> | undefined),
    },
  });
}

describe("apiClient", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.stubGlobal("fetch", fetchMock);
    resetUnauthorizedHandlerForTests();
    registerClientSessionProvider(null);
    vi.stubEnv("NEXT_PUBLIC_API_URL", "http://gateway.test");
    vi.stubEnv("NEXT_PUBLIC_API_TIMEOUT_MS", "5000");
    // Ensure Keycloak refresh path is off — covered by client-refresh.test.ts
    vi.stubEnv("NEXT_PUBLIC_KEYCLOAK_URL", "");
  });

  afterEach(() => {
    fetchMock.mockReset();
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
    resetUnauthorizedHandlerForTests();
    registerClientSessionProvider(null);
  });

  it("unwraps success ApiResponse.data and sends correlation + JSON headers", async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse(
        {
          success: true,
          data: { id: "p1", name: "Alpha" },
          error: null,
          correlationId: "server-corr",
          timestamp: "2026-08-09T00:00:00Z",
        },
        { headers: { [CORRELATION_ID_HEADER]: "server-corr" } }
      )
    );

    const result = await apiClient<{ id: string; name: string }>("/api/projects", {
      correlationId: "client-corr",
    });

    expect(result).toEqual({ id: "p1", name: "Alpha" });
    expect(fetchMock).toHaveBeenCalledOnce();
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("http://gateway.test/api/projects");
    const headers = init.headers as Record<string, string>;
    expect(headers.Accept).toBe("application/json");
    expect(headers[CORRELATION_ID_HEADER]).toBe("client-corr");
  });

  it("attaches Bearer token from getClientSession", async () => {
    registerClientSessionProvider(() => ({
      user: { id: "u1", email: "a@b.c", name: "A", role: "developer" },
      organizationId: "o1",
      permissions: [],
      accessToken: "tok-123",
    }));
    fetchMock.mockResolvedValueOnce(jsonResponse({ success: true, data: { ok: true }, error: null }));

    await apiClient("/api/users/me");

    const headers = (fetchMock.mock.calls[0] as [string, RequestInit])[1].headers as Record<
      string,
      string
    >;
    expect(headers.Authorization).toBe("Bearer tok-123");
  });

  it("maps 400 validation envelope to ApiError", async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse(
        {
          success: false,
          data: null,
          error: {
            code: "VALIDATION_FAILED",
            message: "Project name is required",
            details: [{ field: "name", message: "must not be blank" }],
          },
          timestamp: "2026-08-09T00:00:00Z",
        },
        { status: 400 }
      )
    );

    const err = (await apiClient("/api/projects", { method: "POST", body: {} }).catch(
      (e: unknown) => e
    )) as ApiError;
    expect(err).toBeInstanceOf(ApiError);
    expect(err.status).toBe(400);
    expect(err.code).toBe("VALIDATION_FAILED");
    expect(err.message).toBe("Project name is required");
  });

  it("invokes unauthorized handler on 401 and throws ApiError", async () => {
    const on401 = vi.fn();
    setUnauthorizedHandler(on401);
    fetchMock.mockResolvedValueOnce(
      jsonResponse(
        { success: false, data: null, error: { code: "UNAUTHORIZED", message: "Unauthorized" } },
        { status: 401 }
      )
    );

    const err = (await apiClient("/api/projects").catch((e: unknown) => e)) as ApiError;
    expect(err).toBeInstanceOf(ApiError);
    expect(err.isUnauthorized).toBe(true);
    expect(on401).toHaveBeenCalledWith(
      expect.objectContaining({ path: "/api/projects" })
    );
  });

  it("skips 401 handler when skipAuthHandler is true", async () => {
    const on401 = vi.fn();
    setUnauthorizedHandler(on401);
    fetchMock.mockResolvedValueOnce(
      jsonResponse(
        { success: false, data: null, error: { code: "UNAUTHORIZED", message: "Unauthorized" } },
        { status: 401 }
      )
    );

    await expect(apiClient("/api/auth/status", { skipAuthHandler: true })).rejects.toBeInstanceOf(
      ApiError
    );
    expect(on401).not.toHaveBeenCalled();
  });

  it("throws AuthorizationError on 403 without calling unauthorized handler", async () => {
    const on401 = vi.fn();
    setUnauthorizedHandler(on401);
    fetchMock.mockResolvedValueOnce(
      jsonResponse(
        { success: false, data: null, error: { code: "FORBIDDEN", message: "Forbidden" } },
        { status: 403 }
      )
    );

    const err = (await apiClient("/api/projects/x").catch((e: unknown) => e)) as AuthorizationError;
    expect(err).toBeInstanceOf(AuthorizationError);
    expect(isAuthorizationError(err)).toBe(true);
    expect(err.isForbidden).toBe(true);
    expect(on401).not.toHaveBeenCalled();
  });

  it("maps 404 to ApiError", async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse(
        { success: false, data: null, error: { code: "NOT_FOUND", message: "Missing" } },
        { status: 404 }
      )
    );
    const err = (await apiClient("/api/projects/missing").catch((e: unknown) => e)) as ApiError;
    expect(err.status).toBe(404);
    expect(err.isNotFound).toBe(true);
  });

  it("maps 500 to ApiError", async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse(
        { success: false, data: null, error: { code: "INTERNAL_ERROR", message: "Boom" } },
        { status: 500 }
      )
    );
    const err = (await apiClient("/api/projects").catch((e: unknown) => e)) as ApiError;
    expect(err.status).toBe(500);
    expect(err.isServerError).toBe(true);
  });

  it("maps network failure", async () => {
    fetchMock.mockRejectedValueOnce(new TypeError("Failed to fetch"));
    const err = (await apiClient("/api/projects").catch((e: unknown) => e)) as ApiError;
    expect(err).toBeInstanceOf(ApiError);
    expect(err.code).toBe("NETWORK_ERROR");
    expect(err.isNetwork).toBe(true);
  });

  it("maps timeout via AbortError", async () => {
    fetchMock.mockImplementationOnce(
      () =>
        new Promise((_resolve, reject) => {
          const err = new DOMException("Aborted", "AbortError");
          reject(err);
        })
    );
    const err = (await apiClient("/api/projects", { timeoutMs: 1 }).catch(
      (e: unknown) => e
    )) as ApiError;
    expect(err).toBeInstanceOf(ApiError);
    expect(err.code).toBe("TIMEOUT");
    expect(err.isTimeout).toBe(true);
  });

  it("returns undefined for 204", async () => {
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 204 }));
    await expect(apiClient<void>("/api/projects/1/favorite", { method: "DELETE" })).resolves.toBe(
      undefined
    );
  });
});
