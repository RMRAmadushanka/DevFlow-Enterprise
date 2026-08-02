import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * UI preferences store — global, cross-page UI state that belongs to the
 * design system itself (density, sidebar collapse), not to any feature.
 * This is scaffolding for the Zustand slice pattern used across the app;
 * it intentionally contains no business/domain logic.
 */
export type Density = "comfortable" | "compact";

interface UIPreferencesState {
  density: Density;
  sidebarCollapsed: boolean;
  setDensity: (density: Density) => void;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
}

export const useUIPreferencesStore = create<UIPreferencesState>()(
  persist(
    (set) => ({
      density: "comfortable",
      sidebarCollapsed: false,
      setDensity: (density) => set({ density }),
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
    }),
    { name: "devflow-ui-preferences" }
  )
);
