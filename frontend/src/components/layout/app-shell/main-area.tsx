import * as React from "react";

import type { AppBreadcrumbItem } from "@/components/layout/breadcrumbs/breadcrumb";
import { Navbar } from "@/components/layout/navbar/navbar";
import type { NotificationItem } from "@/components/layout/notification-center/types";
import type { AppUser } from "@/components/layout/user-menu/types";
import { PageTransition } from "./page-transition";

export interface MainAreaProps {
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
  children: React.ReactNode;
}

/** The column to the right of the sidebar: `Navbar` + scrollable page content. */
export function MainArea({ children, ...navbarProps }: MainAreaProps) {
  return (
    <div className="flex min-w-0 flex-1 flex-col">
      <Navbar {...navbarProps} />
      <main id="main-content" className="min-w-0 flex-1">
        <PageTransition>{children}</PageTransition>
      </main>
    </div>
  );
}
