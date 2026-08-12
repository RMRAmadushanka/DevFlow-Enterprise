/**
 * Restrict post-login redirects to same-origin relative paths.
 * Blocks open redirects such as `//evil.example` and `/\evil`.
 */
export function safeInternalPath(
  next: string | null | undefined,
  fallback: string
): string {
  if (!next) return fallback;
  const trimmed = next.trim();
  if (!trimmed.startsWith("/")) return fallback;
  if (trimmed.startsWith("//")) return fallback;
  if (trimmed.includes("\\")) return fallback;
  if (/^\/[a-z][a-z0-9+.-]*:/i.test(trimmed)) return fallback;
  return trimmed;
}
