"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

import {
  DEFAULT_SPRINT_FILTERS,
  SPRINT_STORAGE_KEY,
} from "../constants/sprint.constants";
import type { SprintFilters, SprintSortField } from "../types/sprint.types";

interface SprintUiState {
  filters: SprintFilters;
  sort: SprintSortField;
  selectedBacklogIds: string[];
  setFilters: (patch: Partial<SprintFilters>) => void;
  setSearch: (q: string) => void;
  setSort: (sort: SprintSortField) => void;
  setSelectedBacklogIds: (ids: string[]) => void;
  resetFilters: () => void;
}

export const useSprintStore = create<SprintUiState>()(
  persist(
    (set) => ({
      filters: DEFAULT_SPRINT_FILTERS,
      sort: "newest",
      selectedBacklogIds: [],
      setFilters: (patch) =>
        set((state) => ({ filters: { ...state.filters, ...patch } })),
      setSearch: (q) => set((state) => ({ filters: { ...state.filters, q } })),
      setSort: (sort) => set({ sort }),
      setSelectedBacklogIds: (selectedBacklogIds) => set({ selectedBacklogIds }),
      resetFilters: () => set({ filters: DEFAULT_SPRINT_FILTERS }),
    }),
    {
      name: SPRINT_STORAGE_KEY,
      partialize: (state) => ({
        sort: state.sort,
        filters: {
          projectId: state.filters.projectId,
          status: state.filters.status,
        },
      }),
      merge: (persisted, current) => {
        const p = persisted as Partial<SprintUiState> | undefined;
        return {
          ...current,
          ...p,
          filters: { ...current.filters, ...p?.filters },
        };
      },
    }
  )
);
