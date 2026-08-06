import type { Role } from "@/lib/permissions/roles";

/**
 * Session contracts — architecture placeholders.
 * Wire to a real auth provider later; features must depend on these types only.
 */

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  role: Role;
}

export interface AuthSession {
  user: AuthUser;
  organizationId: string;
  permissions: string[];
  accessToken?: string;
}
