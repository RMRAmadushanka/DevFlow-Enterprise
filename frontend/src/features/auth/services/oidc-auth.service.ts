import {
  beginLoginRedirect,
  beginPasswordResetRedirect,
  beginRegisterRedirect,
  buildSessionIfAuthenticated,
  clearAuthMarkerCookie,
  clearOidcSessionArtifacts,
  completeLoginAfterRedirect,
  isKeycloakEnabled,
  keycloakLogout,
} from "@/lib/auth/keycloak";
import type { AuthSessionInfo } from "../types/auth.types";
import { AuthenticationError } from "../utils/errors";

/**
 * Keycloak JS–backed auth service (public client, PKCE S256, in-memory tokens).
 */
export const oidcAuthService = {
  isEnabled: isKeycloakEnabled,

  /** Redirect to Keycloak login — does not return. */
  async startLogin(next?: string): Promise<never> {
    await beginLoginRedirect({ next });
    throw new AuthenticationError("Redirecting to identity provider");
  },

  /** Redirect to Keycloak registration — does not return. */
  async startRegister(next?: string): Promise<never> {
    await beginRegisterRedirect({ next });
    throw new AuthenticationError("Redirecting to registration");
  },

  /** Redirect to Keycloak password reset — does not return. */
  async startPasswordReset(): Promise<never> {
    await beginPasswordResetRedirect();
    throw new AuthenticationError("Redirecting to password reset");
  },

  async completeLoginFromCallback(): Promise<{ session: AuthSessionInfo; next: string | null }> {
    return completeLoginAfterRedirect();
  },

  async getSession(): Promise<AuthSessionInfo | null> {
    // Probe only — do not clear tokens/cookies on a null result.
    // Clearing here caused a login loop: dashboard bootstrap wiped the
    // in-memory Keycloak session, then /login immediately restarted OIDC.
    return buildSessionIfAuthenticated();
  },

  async logout(): Promise<void> {
    clearOidcSessionArtifacts();
    clearAuthMarkerCookie();
    await keycloakLogout();
  },
};
