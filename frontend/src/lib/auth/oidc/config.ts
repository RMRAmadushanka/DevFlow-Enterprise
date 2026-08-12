/**
 * Compatibility — prefer `@/lib/auth/keycloak/config`.
 */
export {
  AUTH_MARKER_COOKIE,
  getKeycloakConfig as getOidcConfig,
  isKeycloakEnabled,
  isOidcEnabled,
  type KeycloakPublicConfig as OidcConfig,
} from "../keycloak/config";
