/** auth-service DTOs */

export interface AuthHealth {
  service: string;
  status: string;
  phase?: string;
}

export interface AuthStatus {
  authenticated: boolean;
  userId: string | null;
  username: string | null;
  roles: string[];
}

export interface CurrentUser {
  id: string;
  username: string;
  email?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  roles: string[];
  emailVerified: boolean;
}

export interface LogoutResponse {
  success: boolean;
  message?: string | null;
  keycloakLogoutUrl?: string | null;
}
