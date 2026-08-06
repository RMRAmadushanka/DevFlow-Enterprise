"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

import {
  DEFAULT_REPOSITORY_FILTERS,
  REPOSITORY_STORAGE_KEY,
} from "../constants/repository.constants";
import type {
  RepositoryFilters,
  RepositorySortField,
  RepositoryViewMode,
} from "../types/repository.types";

interface RepositoryUiState {
  filters: RepositoryFilters;
  sort: RepositorySortField;
  viewMode: RepositoryViewMode;
  selectedBranch: string | null;
  expandedFilePaths: string[];
  commitViewMode: "timeline" | "table";
  setFilters: (patch: Partial<RepositoryFilters>) => void;
  setSearch: (q: string) => void;
  setSort: (sort: RepositorySortField) => void;
  setViewMode: (viewMode: RepositoryViewMode) => void;
  setSelectedBranch: (branch: string | null) => void;
  toggleFilePath: (path: string) => void;
  setExpandedFilePaths: (paths: string[]) => void;
  setCommitViewMode: (mode: "timeline" | "table") => void;
  resetFilters: () => void;
}

export const useRepositoryStore = create<RepositoryUiState>()(
  persist(
    (set) => ({
      filters: DEFAULT_REPOSITORY_FILTERS,
      sort: "recently_updated",
      viewMode: "grid",
      selectedBranch: null,
      expandedFilePaths: ["src", "src/features"],
      commitViewMode: "timeline",
      setFilters: (patch) =>
        set((state) => ({ filters: { ...state.filters, ...patch } })),
      setSearch: (q) => set((state) => ({ filters: { ...state.filters, q } })),
      setSort: (sort) => set({ sort }),
      setViewMode: (viewMode) => set({ viewMode }),
      setSelectedBranch: (selectedBranch) => set({ selectedBranch }),
      toggleFilePath: (path) =>
        set((state) => ({
          expandedFilePaths: state.expandedFilePaths.includes(path)
            ? state.expandedFilePaths.filter((p) => p !== path)
            : [...state.expandedFilePaths, path],
        })),
      setExpandedFilePaths: (expandedFilePaths) => set({ expandedFilePaths }),
      setCommitViewMode: (commitViewMode) => set({ commitViewMode }),
      resetFilters: () => set({ filters: DEFAULT_REPOSITORY_FILTERS }),
    }),
    {
      name: REPOSITORY_STORAGE_KEY,
      partialize: (state) => ({
        sort: state.sort,
        viewMode: state.viewMode,
        commitViewMode: state.commitViewMode,
        filters: {
          visibility: state.filters.visibility,
          provider: state.filters.provider,
          language: state.filters.language,
        },
      }),
      merge: (persisted, current) => {
        const p = persisted as Partial<RepositoryUiState> | undefined;
        return {
          ...current,
          ...p,
          filters: { ...current.filters, ...p?.filters },
        };
      },
    }
  )
);
