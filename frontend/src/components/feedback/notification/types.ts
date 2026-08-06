import type * as React from "react";
import type { LucideIcon } from "lucide-react";

export interface NotificationData {
  id: string;
  title: string;
  description?: string;
  timestamp: string | Date;
  read: boolean;
  icon?: LucideIcon;
  href?: string;
  category?: string;
}

export type NotificationFilter = "all" | "unread";

export interface NotificationPanelProps {
  notifications: NotificationData[];
  filter?: NotificationFilter;
  onFilterChange?: (filter: NotificationFilter) => void;
  onNotificationClick?: (notification: NotificationData) => void;
  onMarkAllRead?: () => void;
  onClearAll?: () => void;
  empty?: React.ReactNode;
  className?: string;
  /** Accessible label. @default "Notifications" */
  label?: string;
}

export interface NotificationItemProps {
  notification: NotificationData;
  onClick?: (notification: NotificationData) => void;
  className?: string;
}

export interface NotificationBadgeProps {
  count: number;
  /** Cap displayed as "N+". @default 99 */
  max?: number;
  className?: string;
}

export interface NotificationGroupProps {
  heading: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}
