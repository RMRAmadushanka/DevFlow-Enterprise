import type { ApiSuccess, HttpMethod } from "@/types/api";
import { ApiError } from "./errors";

export interface ApiRequestOptions extends Omit<RequestInit, "method" | "body"> {
  method?: HttpMethod;
  /** JSON body — serialized automatically. */
  body?: unknown;
  /** Query string params; nullish values are omitted. */
  query?: Record<string, string | number | boolean | null | undefined>;
}

function buildUrl(path: string, query?: ApiRequestOptions["query"]): string {
  const base = typeof window === "undefined" ? process.env.NEXT_PUBLIC_API_BASE_URL ?? "" : "";
  const url = new URL(path.startsWith("http") ? path : `${base}${path}`, "http://localhost");

  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value === undefined || value === null || value === "") continue;
      url.searchParams.set(key, String(value));
    }
  }

  // Preserve path+search when using a relative API base in the browser.
  if (!base && !path.startsWith("http")) {
    const qs = url.searchParams.toString();
    return qs ? `${path.split("?")[0]}?${qs}` : path.split("?")[0]!;
  }

  return url.toString();
}

/**
 * Thin fetch wrapper for the service layer.
 * Architecture only — no endpoints or auth session wiring yet.
 *
 * Rules:
 * - Components never call this directly
 * - Feature services wrap domain endpoints with typed DTOs
 */
export async function apiClient<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const { method = "GET", body, query, headers, ...rest } = options;

  let response: Response;
  try {
    response = await fetch(buildUrl(path, query), {
      method,
      headers: {
        Accept: "application/json",
        ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
        ...headers,
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
      ...rest,
    });
  } catch {
    throw new ApiError({ message: "Network request failed", status: 0, code: "NETWORK_ERROR" });
  }

  if (!response.ok) {
    let message = response.statusText || "Request failed";
    let code: string | undefined;
    let details: Record<string, unknown> | undefined;

    try {
      const payload = (await response.json()) as { message?: string; code?: string; details?: Record<string, unknown> };
      message = payload.message ?? message;
      code = payload.code;
      details = payload.details;
    } catch {
      // non-JSON error body
    }

    throw new ApiError({ message, status: response.status, code, details });
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const json = (await response.json()) as ApiSuccess<T> | T;
  if (json && typeof json === "object" && "data" in json) {
    return (json as ApiSuccess<T>).data;
  }
  return json as T;
}
