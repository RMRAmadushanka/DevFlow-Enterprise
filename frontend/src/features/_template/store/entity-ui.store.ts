import { create } from "zustand";

import type { ViewMode } from "@/components/layout/page-templates";

/**
 * Feature UI state only (view mode, panel open).
 * Never store server entities here — use TanStack Query for that.
 */
interface EntityUiState {
  viewMode: ViewMode;
  detailPanelOpen: boolean;
  setViewMode: (mode: ViewMode) => void;
  setDetailPanelOpen: (open: boolean) => void;
}

export const useEntityUiStore = create<EntityUiState>()((set) => ({
  viewMode: "table",
  detailPanelOpen: false,
  setViewMode: (viewMode) => set({ viewMode }),
  setDetailPanelOpen: (detailPanelOpen) => set({ detailPanelOpen }),
}));
