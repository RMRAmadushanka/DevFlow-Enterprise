"use client";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Bell } from "lucide-react";

import { cn } from "@/lib/utils";
import { iconSize } from "@/design-system/tokens/icons";
import type { NotificationItem as NotificationItemType } from "./types";

export interface NotificationItemProps {
  notification: NotificationItemType;
  onClick?: (notification: NotificationItemType) => void;
}

export function NotificationItem({ notification, onClick }: NotificationItemProps) {
  const Icon = notification.icon ?? Bell;
  const timestamp =
    typeof notification.timestamp === "string" ? new Date(notification.timestamp) : notification.timestamp;

  const body = (
    <>
      <span
        className={cn(
          "mt-1.5 flex size-7 shrink-0 items-center justify-center rounded-full",
          notification.read ? "bg-muted text-text-muted" : "bg-primary-muted text-primary"
        )}
      >
        <Icon size={iconSize.sm} aria-hidden="true" />
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-0.5 py-1.5 text-left">
        <span className="flex items-start justify-between gap-2">
          <span className={cn("text-sm", notification.read ? "text-text-secondary" : "font-medium text-text-primary")}>
            {notification.title}
          </span>
          {!notification.read && (
            <span aria-hidden="true" className="mt-1 size-1.5 shrink-0 rounded-full bg-primary" />
          )}
        </span>
        {notification.description && (
          <span className="text-xs text-text-muted">{notification.description}</span>
        )}
        <span className="text-xs text-text-muted">{formatDistanceToNow(timestamp, { addSuffix: true })}</span>
      </span>
    </>
  );

  const className = "flex w-full items-start gap-2.5 rounded-md px-2 py-1 text-left outline-none transition-colors hover:bg-accent focus-visible:bg-accent";

  if (notification.href) {
    return (
      <Link href={notification.href} onClick={() => onClick?.(notification)} className={className}>
        {body}
      </Link>
    );
  }

  return (
    <button type="button" onClick={() => onClick?.(notification)} className={className}>
      {body}
    </button>
  );
}
