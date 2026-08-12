/**
 * Compatibility re-exports — Keycloak JS is the OIDC implementation (Prompt 6B).
 * Prefer importing from `@/lib/auth/keycloak`.
 */

export {
  AUTH_MARKER_COOKIE,
  getKeycloakConfig as getOidcConfig,
  isOidcEnabled,
  isKeycloakEnabled,
} from "../keycloak/config";
export { setAuthMarkerCookie, clearAuthMarkerCookie } from "../keycloak/auth-marker";
export {
  beginLoginRedirect,
  beginRegisterRedirect,
  beginPasswordResetRedirect,
  clearOidcSessionArtifacts,
  refreshAccessToken,
  getAccessToken,
  getIdToken,
  ensureKeycloakReady,
  buildSessionIfAuthenticated,
  completeLoginAfterRedirect,
  keycloakLogout,
  hasRealmRole,
  hasResourceRole,
  isAuthenticated,
} from "../keycloak";
export {
  fetchCurrentUserBundle,
  profileFromClaims,
  toAuthSessionInfo,
  toLibAuthSession,
} from "../keycloak/session-builder";
export { decodeJwtPayload, mapRealmRolesToUiRole, realmRolesFromClaims } from "./jwt";
export type { JwtClaims } from "./jwt";
