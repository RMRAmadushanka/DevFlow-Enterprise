"use client";

import { Bell, BellOff, CheckCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Text } from "@/components/ui/typography";
import { iconSize } from "@/design-system/tokens/icons";
import { cn } from "@/lib/utils";
import { NotificationItem } from "./notification-item";
import type { NotificationItem as NotificationItemType } from "./types";

export interface NotificationBellProps {
  notifications: NotificationItemType[];
  onNotificationClick?: (notification: NotificationItemType) => void;
  onMarkAllRead?: () => void;
  onClearAll?: () => void;
}

/**
 * Notification center trigger + dropdown. Uses a `Popover` (not a
 * `DropdownMenu`) since its content — a scrollable, richly interactive
 * list with per-row navigation and header actions — doesn't fit the
 * single-select, roving-tabindex semantics of a menu.
 */
export function NotificationBell({
  notifications,
  onNotificationClick,
  onMarkAllRead,
  onClearAll,
}: NotificationBellProps) {
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button variant="ghost" size="icon" className="relative" aria-label={`Notifications (${unreadCount} unread)`} />
        }
      >
        <Bell size={iconSize.md} />
        {unreadCount > 0 && (
          <span
            aria-hidden="true"
            className={cn(
              "absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-semibold text-danger-foreground"
            )}
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between border-b border-border px-3 py-2.5">
          <Text variant="label">Notifications</Text>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" onClick={onMarkAllRead} disabled={unreadCount === 0}>
              <CheckCheck size={iconSize.xs} /> Mark all read
            </Button>
          </div>
        </div>
        <div className="flex max-h-96 flex-col gap-0.5 overflow-y-auto p-1.5">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
              <BellOff size={iconSize.lg} className="text-text-muted" />
              <Text tone="muted" variant="small">
                You&apos;re all caught up.
              </Text>
            </div>
          ) : (
            notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onClick={onNotificationClick}
              />
            ))
          )}
        </div>
        {notifications.length > 0 && (
          <div className="border-t border-border p-1.5">
            <Button variant="ghost" size="sm" className="w-full" onClick={onClearAll}>
              Clear all
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
