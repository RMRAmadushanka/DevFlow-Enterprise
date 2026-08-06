"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

import {
  DEFAULT_DOCUMENT_FILTERS,
  DOCUMENT_STORAGE_KEY,
} from "../constants/document.constants";
import type {
  DocumentEditorMode,
  DocumentFilters,
  DocumentSidebarSection,
  DocumentSortField,
  DocumentViewMode,
} from "../types/document.types";

interface DocumentUiState {
  filters: DocumentFilters;
  sort: DocumentSortField;
  viewMode: DocumentViewMode;
  editorMode: DocumentEditorMode;
  sidebarCollapsed: boolean;
  sidebarSection: DocumentSidebarSection;
  expandedTreeIds: string[];
  autoSaveStatus: "idle" | "saving" | "saved" | "error";
  setFilters: (patch: Partial<DocumentFilters>) => void;
  setSearch: (q: string) => void;
  setSort: (sort: DocumentSortField) => void;
  setViewMode: (viewMode: DocumentViewMode) => void;
  setEditorMode: (editorMode: DocumentEditorMode) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setSidebarSection: (section: DocumentSidebarSection) => void;
  toggleTreeNode: (id: string) => void;
  setExpandedTreeIds: (ids: string[]) => void;
  setAutoSaveStatus: (status: DocumentUiState["autoSaveStatus"]) => void;
  resetFilters: () => void;
}

export const useDocumentStore = create<DocumentUiState>()(
  persist(
    (set) => ({
      filters: DEFAULT_DOCUMENT_FILTERS,
      sort: "recently_updated",
      viewMode: "grid",
      editorMode: "rich",
      sidebarCollapsed: false,
      sidebarSection: "workspace",
      expandedTreeIds: ["folder_eng", "folder_product"],
      autoSaveStatus: "idle",
      setFilters: (patch) =>
        set((state) => ({ filters: { ...state.filters, ...patch } })),
      setSearch: (q) => set((state) => ({ filters: { ...state.filters, q } })),
      setSort: (sort) => set({ sort }),
      setViewMode: (viewMode) => set({ viewMode }),
      setEditorMode: (editorMode) => set({ editorMode }),
      setSidebarCollapsed: (sidebarCollapsed) => set({ sidebarCollapsed }),
      setSidebarSection: (sidebarSection) => set({ sidebarSection }),
      toggleTreeNode: (id) =>
        set((state) => ({
          expandedTreeIds: state.expandedTreeIds.includes(id)
            ? state.expandedTreeIds.filter((x) => x !== id)
            : [...state.expandedTreeIds, id],
        })),
      setExpandedTreeIds: (expandedTreeIds) => set({ expandedTreeIds }),
      setAutoSaveStatus: (autoSaveStatus) => set({ autoSaveStatus }),
      resetFilters: () => set({ filters: DEFAULT_DOCUMENT_FILTERS }),
    }),
    {
      name: DOCUMENT_STORAGE_KEY,
      partialize: (state) => ({
        sort: state.sort,
        viewMode: state.viewMode,
        editorMode: state.editorMode,
        sidebarCollapsed: state.sidebarCollapsed,
        expandedTreeIds: state.expandedTreeIds,
        filters: {
          folderId: state.filters.folderId,
          visibility: state.filters.visibility,
          favoritesOnly: state.filters.favoritesOnly,
        },
      }),
      merge: (persisted, current) => {
        const p = persisted as Partial<DocumentUiState> | undefined;
        return {
          ...current,
          ...p,
          filters: { ...current.filters, ...p?.filters },
        };
      },
    }
  )
);
