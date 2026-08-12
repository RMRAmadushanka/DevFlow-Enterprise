import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { AUTH_MARKER_COOKIE } from "@/lib/auth/keycloak/config";

/**
 * Lightweight gate for dashboard routes using a non-credential auth marker cookie.
 * Real authorization is enforced by the API Gateway JWT validation.
 * Client shell (`AuthenticatedShell`) remains the primary UX guard.
 */
const PROTECTED_PREFIXES = [
  "/dashboard",
  "/home",
  "/profile",
  "/account",
  "/organizations",
  "/settings",
  "/projects",
  "/tasks",
  "/sprints",
  "/repositories",
  "/documents",
  "/analytics",
  "/monitoring",
  "/deployments",
];

function isProtectedPath(pathname: string): boolean {
  if (pathname === "/") return true;
  return PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!isProtectedPath(pathname)) {
    return NextResponse.next();
  }

  const marker = request.cookies.get(AUTH_MARKER_COOKIE)?.value;
  if (marker === "1") {
    return NextResponse.next();
  }

  // When OIDC is not configured, mock auth may only use sessionStorage — allow
  // through and let AuthenticatedShell redirect. Middleware cannot read sessionStorage.
  if (!process.env.NEXT_PUBLIC_KEYCLOAK_URL) {
    return NextResponse.next();
  }

  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = "/login";
  loginUrl.searchParams.set("next", `${pathname}${request.nextUrl.search}`);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|design-system|shell-preview|login|register|forgot-password|reset-password|verify-email|auth/callback).*)",
  ],
};
