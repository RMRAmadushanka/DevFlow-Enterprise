import { getClientSession } from "@/lib/auth";
import { isKeycloakEnabled, refreshAccessToken } from "@/lib/auth/keycloak";
import type { ApiSuccess, HttpMethod } from "@/types/api";
import { CORRELATION_ID_HEADER, getApiBaseUrl, getApiTimeoutMs } from "./config";
import { createCorrelationId } from "./correlation";
import { ApiError, AuthorizationError } from "./errors";
import { notifyUnauthorized } from "./interceptors/unauthorized";
import type { ApiEnvelope, ApiErrorDetail } from "./types/envelope";

export interface ApiRequestOptions extends Omit<RequestInit, "method" | "body" | "signal"> {
  method?: HttpMethod;
  /** JSON body — serialized automatically. */
  body?: unknown;
  /** Query string params; nullish values are omitted. */
  query?: Record<string, string | number | boolean | null | undefined>;
  /** Override timeout (ms). */
  timeoutMs?: number;
  /** Skip centralized 401 handler (e.g. login/status probes). */
  skipAuthHandler?: boolean;
  /** Propagate an existing correlation id; otherwise one is generated. */
  correlationId?: string;
  /** Optional abort signal merged with timeout. */
  signal?: AbortSignal;
  /** Internal: prevent infinite refresh retry loops. */
  _retried?: boolean;
}

function buildUrl(path: string, query?: ApiRequestOptions["query"]): string {
  const base = getApiBaseUrl();
  const normalizedPath = path.startsWith("/") || path.startsWith("http") ? path : `/${path}`;

  if (path.startsWith("http")) {
    const url = new URL(path);
    applyQuery(url, query);
    return url.toString();
  }

  if (base) {
    const url = new URL(`${base}${normalizedPath}`);
    applyQuery(url, query);
    return url.toString();
  }

  // Relative (browser → same origin / Next rewrite)
  const url = new URL(normalizedPath, "http://local.invalid");
  applyQuery(url, query);
  const qs = url.searchParams.toString();
  return qs ? `${url.pathname}?${qs}` : url.pathname;
}

function applyQuery(url: URL, query?: ApiRequestOptions["query"]): void {
  if (!query) return;
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === "") continue;
    url.searchParams.set(key, String(value));
  }
}

function mergeSignals(timeoutMs: number, external?: AbortSignal): {
  signal: AbortSignal;
  cleanup: () => void;
} {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort("timeout"), timeoutMs);

  const onExternalAbort = () => controller.abort(external?.reason);
  if (external) {
    if (external.aborted) {
      controller.abort(external.reason);
    } else {
      external.addEventListener("abort", onExternalAbort, { once: true });
    }
  }

  return {
    signal: controller.signal,
    cleanup: () => {
      clearTimeout(timer);
      external?.removeEventListener("abort", onExternalAbort);
    },
  };
}

function normalizeDetails(
  details: unknown
): Record<string, unknown> | ApiErrorDetail[] | undefined {
  if (details == null) return undefined;
  if (Array.isArray(details)) return details as ApiErrorDetail[];
  if (typeof details === "object") return details as Record<string, unknown>;
  return undefined;
}

/**
 * Centralized fetch client for the service layer.
 *
 * - Base URL from `NEXT_PUBLIC_API_URL` / `NEXT_PUBLIC_API_BASE_URL`
 * - JSON encode/decode + DevFlow envelope unwrap
 * - Bearer from {@link getClientSession} (existing auth surface)
 * - `X-Correlation-Id` on every request
 * - Timeout, network, and HTTP error mapping
 * - Central 401 handler; 403 → {@link AuthorizationError} (no logout)
 */
export async function apiClient<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const {
    method = "GET",
    body,
    query,
    headers,
    timeoutMs = getApiTimeoutMs(),
    skipAuthHandler = false,
    correlationId = createCorrelationId(),
    signal: externalSignal,
    _retried = false,
    ...rest
  } = options;

  const sessionToken = getClientSession()?.accessToken;
  const headerRecord = (headers ?? {}) as Record<string, string>;
  const authorization =
    headerRecord.Authorization || (sessionToken ? `Bearer ${sessionToken}` : undefined);

  const { signal, cleanup } = mergeSignals(timeoutMs, externalSignal);

  let response: Response;
  try {
    response = await fetch(buildUrl(path, query), {
      method,
      headers: {
        Accept: "application/json",
        [CORRELATION_ID_HEADER]: correlationId,
        ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
        ...(authorization ? { Authorization: authorization } : {}),
        ...headerRecord,
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal,
      ...rest,
    });
  } catch (error) {
    const aborted =
      (error instanceof DOMException && error.name === "AbortError") ||
      (error instanceof Error && error.name === "AbortError") ||
      signal.aborted;
    if (aborted) {
      throw new ApiError({
        message: "Request timed out",
        status: 408,
        code: "TIMEOUT",
        correlationId,
        path,
      });
    }
    throw new ApiError({
      message: "Network request failed",
      status: 0,
      code: "NETWORK_ERROR",
      correlationId,
      path,
    });
  } finally {
    cleanup();
  }

  const responseCorrelation =
    response.headers.get(CORRELATION_ID_HEADER) ?? correlationId;

  if (!response.ok) {
    let message = response.statusText || "Request failed";
    let code: string | undefined;
    let details: Record<string, unknown> | ApiErrorDetail[] | undefined;
    let timestamp: string | undefined;

    try {
      const payload = (await response.json()) as Partial<ApiEnvelope<unknown>> & {
        message?: string;
        code?: string;
        details?: unknown;
      };
      message = payload.error?.message ?? payload.message ?? message;
      code = payload.error?.code ?? payload.code;
      details = normalizeDetails(payload.error?.details ?? payload.details);
      timestamp = payload.timestamp ?? undefined;
    } catch {
      // non-JSON error body
    }

    if (response.status === 401) {
      // Single refresh + retry when Keycloak is enabled (no infinite loops).
      if (!skipAuthHandler && !_retried && isKeycloakEnabled()) {
        const refreshed = await refreshAccessToken(30);
        if (refreshed?.accessToken) {
          return apiClient<T>(path, {
            ...options,
            correlationId,
            _retried: true,
            headers: {
              ...headerRecord,
              Authorization: `Bearer ${refreshed.accessToken}`,
            },
          });
        }
      }

      if (!skipAuthHandler) {
        await notifyUnauthorized({ path, correlationId: responseCorrelation });
      }
      throw new ApiError({
        message,
        status: 401,
        code: code ?? "UNAUTHORIZED",
        details,
        correlationId: responseCorrelation,
        timestamp,
        path,
      });
    }

    if (response.status === 403) {
      throw new AuthorizationError({
        message,
        status: 403,
        code: code ?? "FORBIDDEN",
        details,
        correlationId: responseCorrelation,
        timestamp,
        path,
      });
    }

    throw new ApiError({
      message,
      status: response.status,
      code,
      details,
      correlationId: responseCorrelation,
      timestamp,
      path,
    });
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const json = (await response.json()) as ApiSuccess<T> | ApiEnvelope<T> | T;
  if (json && typeof json === "object" && "data" in json) {
    return (json as ApiSuccess<T> | ApiEnvelope<T>).data as T;
  }
  return json as T;
}
