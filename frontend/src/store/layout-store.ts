import { create } from "zustand";

/**
 * Ephemeral layout UI state — mobile navigation drawer + command menu open
 * state. Deliberately NOT persisted (unlike `useUIPreferencesStore`'s
 * `sidebarCollapsed`): reopening a drawer or command palette on page
 * reload would be surprising, whereas remembering sidebar collapse is a
 * genuine preference.
 *
 * This store contains no business/domain data — only "is this piece of
 * chrome open or closed" state shared across the layout components.
 */
interface LayoutState {
  mobileNavOpen: boolean;
  commandMenuOpen: boolean;
  openMobileNav: () => void;
  closeMobileNav: () => void;
  toggleMobileNav: () => void;
  setCommandMenuOpen: (open: boolean) => void;
  toggleCommandMenu: () => void;
}

export const useLayoutStore = create<LayoutState>()((set) => ({
  mobileNavOpen: false,
  commandMenuOpen: false,
  openMobileNav: () => set({ mobileNavOpen: true }),
  closeMobileNav: () => set({ mobileNavOpen: false }),
  toggleMobileNav: () => set((s) => ({ mobileNavOpen: !s.mobileNavOpen })),
  setCommandMenuOpen: (open) => set({ commandMenuOpen: open }),
  toggleCommandMenu: () => set((s) => ({ commandMenuOpen: !s.commandMenuOpen })),
}));
