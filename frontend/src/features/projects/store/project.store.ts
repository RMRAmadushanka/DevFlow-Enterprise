"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

import {
  DEFAULT_PROJECT_FILTERS,
  PROJECT_STORAGE_KEY,
} from "../constants/project.constants";
import type {
  ProjectFilters,
  ProjectSortField,
  ProjectViewMode,
} from "../types/project.types";

interface ProjectUiState {
  filters: ProjectFilters;
  sort: ProjectSortField;
  viewMode: ProjectViewMode;
  setFilters: (patch: Partial<ProjectFilters>) => void;
  setSearch: (q: string) => void;
  setSort: (sort: ProjectSortField) => void;
  setViewMode: (viewMode: ProjectViewMode) => void;
  resetFilters: () => void;
}

export const useProjectStore = create<ProjectUiState>()(
  persist(
    (set) => ({
      filters: DEFAULT_PROJECT_FILTERS,
      sort: "updated",
      viewMode: "grid",
      setFilters: (patch) =>
        set((state) => ({ filters: { ...state.filters, ...patch } })),
      setSearch: (q) => set((state) => ({ filters: { ...state.filters, q } })),
      setSort: (sort) => set({ sort }),
      setViewMode: (viewMode) => set({ viewMode }),
      resetFilters: () => set({ filters: DEFAULT_PROJECT_FILTERS }),
    }),
    {
      name: PROJECT_STORAGE_KEY,
      partialize: (state) => ({
        viewMode: state.viewMode,
        sort: state.sort,
        filters: {
          organizationId: state.filters.organizationId,
          favoritesOnly: state.filters.favoritesOnly,
          archived: state.filters.archived,
        },
      }),
      merge: (persisted, current) => {
        const p = persisted as Partial<ProjectUiState> | undefined;
        return {
          ...current,
          ...p,
          filters: { ...current.filters, ...p?.filters },
        };
      },
    }
  )
);
