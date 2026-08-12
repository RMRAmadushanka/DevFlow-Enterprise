import { AUTH_MARKER_COOKIE } from "./config";

/** Non-credential cookie so middleware can gate dashboard routes. */
export function setAuthMarkerCookie(): void {
  if (typeof document === "undefined") return;
  document.cookie = `${AUTH_MARKER_COOKIE}=1; Path=/; SameSite=Lax; Max-Age=86400`;
}

export function clearAuthMarkerCookie(): void {
  if (typeof document === "undefined") return;
  document.cookie = `${AUTH_MARKER_COOKIE}=; Path=/; SameSite=Lax; Max-Age=0`;
}
