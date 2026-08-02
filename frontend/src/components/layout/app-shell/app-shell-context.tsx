"use client";

import * as React from "react";

import type { LayoutBreakpoint } from "./use-responsive";

export interface AppShellContextValue {
  breakpoint: LayoutBreakpoint;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  sidebarCollapsed: boolean;
  toggleSidebarCollapsed: () => void;
  mobileNavOpen: boolean;
  openMobileNav: () => void;
  closeMobileNav: () => void;
}

const AppShellContext = React.createContext<AppShellContextValue | null>(null);

export function AppShellProvider({
  value,
  children,
}: {
  value: AppShellContextValue;
  children: React.ReactNode;
}) {
  return <AppShellContext.Provider value={value}>{children}</AppShellContext.Provider>;
}

/**
 * Read shell-level layout state (breakpoint, sidebar collapse, mobile nav)
 * from any descendant of `<AppShell>` — e.g. a page that wants to adapt
 * its own layout to the current breakpoint or sidebar state.
 */
export function useAppShell(): AppShellContextValue {
  const context = React.useContext(AppShellContext);
  if (!context) {
    throw new Error("useAppShell() must be called within an <AppShell>.");
  }
  return context;
}
