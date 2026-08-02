"use client";

import { usePathname } from "next/navigation";

import { UserDropdown } from "@/components/layout/user-menu/user-dropdown";
import type { AppUser } from "@/components/layout/user-menu/types";
import { SidebarItem } from "./sidebar-item";
import type { NavGroup } from "./types";

export interface SidebarFooterProps {
  footerGroup: NavGroup;
  user: AppUser;
  collapsed?: boolean;
  onNavigate?: () => void;
  onProfileClick?: () => void;
  onAccountSettingsClick?: () => void;
  onLogout?: () => void;
}

/**
 * Bottom section of the sidebar: utility nav (Settings, Help) followed by
 * the user account menu. Sits below the scrollable main nav, pinned to
 * the bottom of the rail.
 */
export function SidebarFooter({
  footerGroup,
  user,
  collapsed,
  onNavigate,
  onProfileClick,
  onAccountSettingsClick,
  onLogout,
}: SidebarFooterProps) {
  const pathname = usePathname() ?? "/";

  return (
    <div className="flex flex-col gap-1 border-t border-sidebar-border p-2">
      <div className="flex flex-col gap-0.5">
        {footerGroup.items.map((item) => (
          <SidebarItem
            key={item.id}
            label={item.label}
            icon={item.icon}
            href={item.href}
            disabled={item.disabled}
            collapsed={collapsed}
            active={pathname === item.href || pathname.startsWith(`${item.href}/`)}
            onNavigate={onNavigate}
          />
        ))}
      </div>
      <UserDropdown
        user={user}
        variant={collapsed ? "compact" : "full"}
        side="top"
        align={collapsed ? "center" : "start"}
        onProfileClick={onProfileClick}
        onAccountSettingsClick={onAccountSettingsClick}
        onLogout={onLogout}
        className={collapsed ? "mx-auto" : undefined}
      />
    </div>
  );
}
