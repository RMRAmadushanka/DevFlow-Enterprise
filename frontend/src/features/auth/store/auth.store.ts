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
  setSession: (session: AuthSessionInfo | null) => void;
  setUser: (user: AuthUserProfile | null) => void;
  setPermissions: (permissions: string[]) => void;
  updateProfile: (patch: Partial<AuthUserProfile>) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()((set) => ({
  status: "unknown",
  user: null,
  organizationId: null,
  permissions: [],
  sessionId: null,
  setSession: (session) =>
    set(
      session
        ? {
            status: "authenticated",
            user: session.user,
            organizationId: session.organizationId,
            permissions: session.permissions,
            sessionId: session.sessionId,
          }
        : {
            status: "anonymous",
            user: null,
            organizationId: null,
            permissions: [],
            sessionId: null,
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
  logout: () =>
    set({
      status: "anonymous",
      user: null,
      organizationId: null,
      permissions: [],
      sessionId: null,
    }),
}));
