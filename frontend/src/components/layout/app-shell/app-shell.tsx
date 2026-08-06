"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import type { AppBreadcrumbItem } from "@/components/layout/breadcrumbs/breadcrumb";
import { CommandMenu } from "@/components/layout/command-menu/command-menu";
import type { CommandGroupConfig } from "@/components/layout/command-menu/types";
import { MobileBottomNav } from "@/components/layout/mobile-navigation/mobile-bottom-nav";
import { defaultNavGroups } from "@/components/layout/sidebar/nav-config";
import { Sidebar } from "@/components/layout/sidebar/sidebar";
import type { NavGroup, NavItem } from "@/components/layout/sidebar/types";
import type { NotificationItem } from "@/components/layout/notification-center/types";
import type { AppUser } from "@/components/layout/user-menu/types";
import type { Organization, Project } from "@/components/layout/workspace-switcher/types";
import { useLayoutStore } from "@/store/layout-store";
import { useUIPreferencesStore } from "@/store/ui-preferences-store";
import { AppShellProvider } from "./app-shell-context";
import { MainArea } from "./main-area";
import { useResponsiveBreakpoint } from "./use-responsive";

export interface AppShellProps {
  children: React.ReactNode;

  navGroups?: NavGroup[];
  footerNavGroup?: NavGroup;
  logo?: React.ReactNode;
  productName?: string;
  homeHref?: string;

  organizations: Organization[];
  projects: Project[];
  activeOrganizationId: string;
  activeProjectId?: string;
  onSelectOrganization?: (organizationId: string) => void;
  onSelectProject?: (projectId: string) => void;
  onCreateWorkspace?: () => void;
  onWorkspaceSettingsClick?: () => void;
  renderWorkspaceSwitcher?: (ctx: { collapsed: boolean }) => React.ReactNode;

  user: AppUser;
  onProfileClick?: () => void;
  onAccountSettingsClick?: () => void;
  onLogout?: () => void;

  breadcrumbs?: AppBreadcrumbItem[];

  notifications?: NotificationItem[];
  onNotificationClick?: (notification: NotificationItem) => void;
  onMarkAllNotificationsRead?: () => void;
  onClearAllNotifications?: () => void;

  /** Defaults to a "Go to" group auto-derived from `navGroups`. Pass to add more (recent items, actions, …). */
  commandMenuGroups?: CommandGroupConfig[];

  /** Optional — enables a fixed bottom tab bar on mobile in addition to the drawer. */
  bottomNavItems?: NavItem[];
}

function useDerivedCommandGroups(navGroups: NavGroup[]): CommandGroupConfig[] {
  const router = useRouter();
  return React.useMemo(
    () =>
      navGroups.map((group) => ({
        id: group.id,
        heading: group.label ?? "Navigate",
        actions: group.items.map((item) => ({
          id: item.id,
          label: `Go to ${item.label}`,
          icon: item.icon,
          keywords: [item.label],
          onSelect: () => router.push(item.href),
        })),
      })),
    [navGroups, router]
  );
}

/**
 * The main container wrapping every authenticated page. Owns sidebar
 * collapse/mobile-drawer state, responsive breakpoint detection, and the
 * global command menu, and exposes all of it via `useAppShell()` to
 * descendants. Composition:
 *
 * ```
 * <AppShell>
 *   <Sidebar />
 *   <MainArea>
 *     <Navbar />
 *     {children}
 *   </MainArea>
 * </AppShell>
 * ```
 */
export function AppShell({
  children,
  navGroups = defaultNavGroups,
  footerNavGroup,
  logo,
  productName,
  homeHref,
  organizations,
  projects,
  activeOrganizationId,
  activeProjectId,
  onSelectOrganization,
  onSelectProject,
  onCreateWorkspace,
  onWorkspaceSettingsClick,
  renderWorkspaceSwitcher,
  user,
  onProfileClick,
  onAccountSettingsClick,
  onLogout,
  breadcrumbs,
  notifications = [],
  onNotificationClick,
  onMarkAllNotificationsRead,
  onClearAllNotifications,
  commandMenuGroups,
  bottomNavItems,
}: AppShellProps) {
  const breakpoint = useResponsiveBreakpoint();
  const isMobile = breakpoint === "mobile";
  const isTablet = breakpoint === "tablet";
  const isDesktop = breakpoint === "desktop";

  const sidebarCollapsed = useUIPreferencesStore((state) => state.sidebarCollapsed);
  const setSidebarCollapsed = useUIPreferencesStore((state) => state.setSidebarCollapsed);
  const toggleSidebarCollapsed = useUIPreferencesStore((state) => state.toggleSidebar);

  const mobileNavOpen = useLayoutStore((state) => state.mobileNavOpen);
  const openMobileNav = useLayoutStore((state) => state.openMobileNav);
  const closeMobileNav = useLayoutStore((state) => state.closeMobileNav);

  // Tablet defaults to a collapsed rail (per spec) — but only as a
  // one-time default on entering the tablet range, not on every render,
  // so a user who explicitly expands it while on tablet isn't fought.
  const previousBreakpoint = React.useRef(breakpoint);
  React.useEffect(() => {
    if (breakpoint === "tablet" && previousBreakpoint.current !== "tablet") {
      setSidebarCollapsed(true);
    }
    previousBreakpoint.current = breakpoint;
  }, [breakpoint, setSidebarCollapsed]);

  const derivedCommandGroups = useDerivedCommandGroups(navGroups);
  const effectiveCommandGroups = commandMenuGroups ?? derivedCommandGroups;

  const contextValue = React.useMemo(
    () => ({
      breakpoint,
      isMobile,
      isTablet,
      isDesktop,
      sidebarCollapsed,
      toggleSidebarCollapsed,
      mobileNavOpen,
      openMobileNav,
      closeMobileNav,
    }),
    [breakpoint, isMobile, isTablet, isDesktop, sidebarCollapsed, toggleSidebarCollapsed, mobileNavOpen, openMobileNav, closeMobileNav]
  );

  return (
    <AppShellProvider value={contextValue}>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-primary focus:px-3 focus:py-2 focus:text-sm focus:font-medium focus:text-primary-foreground"
      >
        Skip to main content
      </a>

      <div className="flex min-h-screen bg-background">
        <Sidebar
          collapsed={sidebarCollapsed}
          mobileOpen={mobileNavOpen}
          onMobileClose={closeMobileNav}
          onToggleCollapse={toggleSidebarCollapsed}
          navGroups={navGroups}
          footerNavGroup={footerNavGroup}
          organizations={organizations}
          projects={projects}
          activeOrganizationId={activeOrganizationId}
          activeProjectId={activeProjectId}
          onSelectOrganization={onSelectOrganization}
          onSelectProject={onSelectProject}
          onCreateWorkspace={onCreateWorkspace}
          onWorkspaceSettingsClick={onWorkspaceSettingsClick}
          renderWorkspaceSwitcher={renderWorkspaceSwitcher}
          user={user}
          onProfileClick={onProfileClick}
          onAccountSettingsClick={onAccountSettingsClick}
          onLogout={onLogout}
          logo={logo}
          productName={productName}
          homeHref={homeHref}
        />

        <MainArea
          onOpenMobileNav={openMobileNav}
          breadcrumbs={breadcrumbs}
          notifications={notifications}
          onNotificationClick={onNotificationClick}
          onMarkAllNotificationsRead={onMarkAllNotificationsRead}
          onClearAllNotifications={onClearAllNotifications}
          user={user}
          onProfileClick={onProfileClick}
          onAccountSettingsClick={onAccountSettingsClick}
          onLogout={onLogout}
        >
          {children}
        </MainArea>
      </div>

      {bottomNavItems && bottomNavItems.length > 0 && <MobileBottomNav items={bottomNavItems} />}

      <CommandMenu groups={effectiveCommandGroups} />
    </AppShellProvider>
  );
}
