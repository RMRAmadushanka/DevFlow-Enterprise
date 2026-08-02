"use client";

import { Menu } from "lucide-react";

import { AppBreadcrumb, type AppBreadcrumbItem } from "@/components/layout/breadcrumbs/breadcrumb";
import { NotificationBell } from "@/components/layout/notification-center/notification-bell";
import type { NotificationItem } from "@/components/layout/notification-center/types";
import { UserDropdown } from "@/components/layout/user-menu/user-dropdown";
import type { AppUser } from "@/components/layout/user-menu/types";
import { Button } from "@/components/ui/button";
import { iconSize } from "@/design-system/tokens/icons";
import { GlobalSearchTrigger } from "./global-search-trigger";

export interface NavbarProps {
  onOpenMobileNav: () => void;
  breadcrumbs?: AppBreadcrumbItem[];
  notifications: NotificationItem[];
  onNotificationClick?: (notification: NotificationItem) => void;
  onMarkAllNotificationsRead?: () => void;
  onClearAllNotifications?: () => void;
  user: AppUser;
  onProfileClick?: () => void;
  onAccountSettingsClick?: () => void;
  onLogout?: () => void;
}

/**
 * Top navbar: mobile menu trigger + optional breadcrumb on the left,
 * global search / notifications / account menu on the right. Sticky at
 * the top of `MainArea`. Simplifies on mobile — breadcrumb hides, search
 * collapses to an icon-only button.
 */
export function Navbar({
  onOpenMobileNav,
  breadcrumbs,
  notifications,
  onNotificationClick,
  onMarkAllNotificationsRead,
  onClearAllNotifications,
  user,
  onProfileClick,
  onAccountSettingsClick,
  onLogout,
}: NavbarProps) {
  return (
    <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center gap-2 border-b border-border bg-background/95 px-3 backdrop-blur-sm sm:px-4">
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        onClick={onOpenMobileNav}
        aria-label="Open navigation menu"
      >
        <Menu size={iconSize.md} />
      </Button>

      {breadcrumbs && breadcrumbs.length > 0 && (
        <div className="hidden min-w-0 flex-1 sm:block">
          <AppBreadcrumb items={breadcrumbs} />
        </div>
      )}

      <div className="ml-auto flex items-center gap-2">
        <GlobalSearchTrigger />
        <NotificationBell
          notifications={notifications}
          onNotificationClick={onNotificationClick}
          onMarkAllRead={onMarkAllNotificationsRead}
          onClearAll={onClearAllNotifications}
        />
        <UserDropdown
          user={user}
          variant="compact"
          side="bottom"
          onProfileClick={onProfileClick}
          onAccountSettingsClick={onAccountSettingsClick}
          onLogout={onLogout}
        />
      </div>
    </header>
  );
}
