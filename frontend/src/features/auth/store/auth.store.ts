"use client";

import { create } from "zustand";

import type { AuthSessionInfo, AuthStatus, AuthUserProfile } from "../types/auth.types";

/**
 * Client auth chrome state — current user identity for UI.
 * Server/cache reads go through TanStack Query hooks; this store mirrors
 * the authenticated principal for guards, shell, and optimistic profile edits.
 * Never stores passwords. Session markers live in session/local storage via the service.
 */
interface AuthState {
  status: AuthStatus;
  user: AuthUserProfile | null;
  organizationId: string | null;
  permissions: string[];
  sessionId: string | null;
  /** True while logout / session-expiry redirect is in flight — avoids "Sign in required" flash. */
  isSigningOut: boolean;
  setSession: (session: AuthSessionInfo | null) => void;
  setUser: (user: AuthUserProfile | null) => void;
  setPermissions: (permissions: string[]) => void;
  updateProfile: (patch: Partial<AuthUserProfile>) => void;
  beginSignOut: () => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()((set) => ({
  status: "unknown",
  user: null,
  organizationId: null,
  permissions: [],
  sessionId: null,
  isSigningOut: false,
  setSession: (session) =>
    set(
      session
        ? {
            status: "authenticated",
            user: session.user,
            organizationId: session.organizationId,
            permissions: session.permissions,
            sessionId: session.sessionId,
            isSigningOut: false,
          }
        : {
            status: "anonymous",
            user: null,
            organizationId: null,
            permissions: [],
            sessionId: null,
            isSigningOut: false,
          }
    ),
  setUser: (user) => set({ user, status: user ? "authenticated" : "anonymous" }),
  setPermissions: (permissions) => set({ permissions }),
  updateProfile: (patch) =>
    set((state) =>
      state.user
        ? {
            user: {
              ...state.user,
              ...patch,
              name:
                patch.firstName || patch.lastName
                  ? `${patch.firstName ?? state.user.firstName} ${patch.lastName ?? state.user.lastName}`
                  : state.user.name,
            },
          }
        : state
    ),
  beginSignOut: () => set({ isSigningOut: true }),
  logout: () =>
    set({
      status: "anonymous",
      user: null,
      organizationId: null,
      permissions: [],
      sessionId: null,
      isSigningOut: false,
    }),
}));
