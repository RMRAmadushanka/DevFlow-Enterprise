"use client";

import * as React from "react";
import { motion } from "framer-motion";

import { MobileSidebarDrawer } from "@/components/layout/mobile-navigation/mobile-sidebar-drawer";
import type { AppUser } from "@/components/layout/user-menu/types";
import type { Organization, Project } from "@/components/layout/workspace-switcher/types";
import { WorkspaceSwitcher } from "@/components/layout/workspace-switcher/workspace-switcher";
import { duration, easing } from "@/design-system/tokens/motion";
import { cn } from "@/lib/utils";
import { SIDEBAR_WIDTH_COLLAPSED, SIDEBAR_WIDTH_EXPANDED } from "./constants";
import { defaultFooterNavItems, defaultNavGroups } from "./nav-config";
import { SidebarFooter } from "./sidebar-footer";
import { SidebarHeader } from "./sidebar-header";
import { SidebarNav } from "./sidebar-nav";
import type { NavGroup } from "./types";

export interface SidebarProps {
  /** Desktop/tablet collapsed state — icon-only rail at 80px vs full 280px. */
  collapsed: boolean;
  /** Mobile off-canvas drawer open state. */
  mobileOpen: boolean;
  onMobileClose: () => void;
  onToggleCollapse?: () => void;

  navGroups?: NavGroup[];
  footerNavGroup?: NavGroup;

  organizations: Organization[];
  projects: Project[];
  activeOrganizationId: string;
  activeProjectId?: string;
  onSelectOrganization?: (organizationId: string) => void;
  onSelectProject?: (projectId: string) => void;
  onCreateWorkspace?: () => void;
  onWorkspaceSettingsClick?: () => void;

  user: AppUser;
  onProfileClick?: () => void;
  onAccountSettingsClick?: () => void;
  onLogout?: () => void;

  logo?: React.ReactNode;
  productName?: string;
  homeHref?: string;
}

/**
 * Main application navigation. Renders as a fixed, collapsible rail on
 * tablet/desktop (>=768px) and as an off-canvas drawer on mobile
 * (<768px) — both driven by the same content so behavior never diverges
 * between breakpoints.
 */
export function Sidebar({
  collapsed,
  mobileOpen,
  onMobileClose,
  onToggleCollapse,
  navGroups = defaultNavGroups,
  footerNavGroup = defaultFooterNavItems,
  organizations,
  projects,
  activeOrganizationId,
  activeProjectId,
  onSelectOrganization,
  onSelectProject,
  onCreateWorkspace,
  onWorkspaceSettingsClick,
  user,
  onProfileClick,
  onAccountSettingsClick,
  onLogout,
  logo,
  productName,
  homeHref,
}: SidebarProps) {
  const renderContent = (isCollapsed: boolean, closeOnNavigate?: () => void) => (
    <div className="flex h-full flex-col bg-sidebar">
      <SidebarHeader
        collapsed={isCollapsed}
        onToggleCollapse={onToggleCollapse}
        logo={logo}
        productName={productName}
        homeHref={homeHref}
      />
      <WorkspaceSwitcher
        organizations={organizations}
        projects={projects}
        activeOrganizationId={activeOrganizationId}
        activeProjectId={activeProjectId}
        collapsed={isCollapsed}
        onSelectOrganization={onSelectOrganization}
        onSelectProject={onSelectProject}
        onCreateWorkspace={onCreateWorkspace}
        onSettingsClick={onWorkspaceSettingsClick}
      />
      <div className="min-h-0 flex-1 overflow-y-auto px-2 py-2">
        <SidebarNav groups={navGroups} collapsed={isCollapsed} onNavigate={closeOnNavigate} />
      </div>
      <SidebarFooter
        footerGroup={footerNavGroup}
        user={user}
        collapsed={isCollapsed}
        onNavigate={closeOnNavigate}
        onProfileClick={onProfileClick}
        onAccountSettingsClick={onAccountSettingsClick}
        onLogout={onLogout}
      />
    </div>
  );

  return (
    <>
      <motion.aside
        aria-label="Sidebar"
        className={cn(
          "sticky top-0 hidden h-screen shrink-0 overflow-hidden border-r border-sidebar-border md:block"
        )}
        animate={{ width: collapsed ? SIDEBAR_WIDTH_COLLAPSED : SIDEBAR_WIDTH_EXPANDED }}
        transition={{ duration: duration.base, ease: easing.standard }}
      >
        <div style={{ width: collapsed ? SIDEBAR_WIDTH_COLLAPSED : SIDEBAR_WIDTH_EXPANDED }} className="h-full">
          {renderContent(collapsed)}
        </div>
      </motion.aside>

      <MobileSidebarDrawer open={mobileOpen} onClose={onMobileClose}>
        {renderContent(false, onMobileClose)}
      </MobileSidebarDrawer>
    </>
  );
}
