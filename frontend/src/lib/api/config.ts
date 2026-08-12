/**
 * API client configuration from public env vars.
 * Prefer NEXT_PUBLIC_API_URL; NEXT_PUBLIC_API_BASE_URL kept for compatibility.
 */

const DEFAULT_TIMEOUT_MS = 30_000;

export function getApiBaseUrl(): string {
  const url =
    process.env.NEXT_PUBLIC_API_URL?.trim() ||
    process.env.NEXT_PUBLIC_API_BASE_URL?.trim() ||
    "";
  return url.replace(/\/$/, "");
}

export function getApiTimeoutMs(): number {
  const raw = process.env.NEXT_PUBLIC_API_TIMEOUT_MS?.trim();
  if (!raw) return DEFAULT_TIMEOUT_MS;
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_TIMEOUT_MS;
}

export const CORRELATION_ID_HEADER = "X-Correlation-Id";
