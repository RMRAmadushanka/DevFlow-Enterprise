"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

import { ORG_STORAGE_KEY } from "../constants/organization.constants";
import type { Organization } from "../types/organization.types";

/**
 * Organization chrome state — current org selection for switcher / shell.
 * Server lists and detail payloads stay in TanStack Query.
 */
interface OrganizationState {
  currentOrganizationId: string | null;
  /** Lightweight list for switcher labels; refreshed from query hooks. */
  organizations: Organization[];
  switcherOpen: boolean;
  setOrganizations: (organizations: Organization[]) => void;
  switchOrganization: (organizationId: string) => void;
  setSwitcherOpen: (open: boolean) => void;
  clear: () => void;
}

export const useOrganizationStore = create<OrganizationState>()(
  persist(
    (set) => ({
      currentOrganizationId: null,
      organizations: [],
      switcherOpen: false,
      setOrganizations: (organizations) =>
        set((state) => {
          const stillValid = organizations.some((o) => o.id === state.currentOrganizationId);
          return {
            organizations,
            currentOrganizationId:
              stillValid
                ? state.currentOrganizationId
                : (organizations[0]?.id ?? null),
          };
        }),
      switchOrganization: (organizationId) =>
        set({ currentOrganizationId: organizationId, switcherOpen: false }),
      setSwitcherOpen: (open) => set({ switcherOpen: open }),
      clear: () =>
        set({
          currentOrganizationId: null,
          organizations: [],
          switcherOpen: false,
        }),
    }),
    {
      name: ORG_STORAGE_KEY,
      partialize: (state) => ({
        currentOrganizationId: state.currentOrganizationId,
      }),
    }
  )
);
