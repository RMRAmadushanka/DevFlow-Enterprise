"use client";

import * as React from "react";
import { Bell } from "lucide-react";

import { cn } from "@/lib/utils";
import { formatRelativeTime } from "@/components/data-display/shared/formatters";
import type { NotificationItemProps } from "./types";

/** Single notification row — read/unread affordance, relative timestamp. */
function NotificationItem({ notification, onClick, className }: NotificationItemProps) {
  const Icon = notification.icon ?? Bell;

  return (
    <button
      type="button"
      data-slot="notification-item"
      data-read={notification.read || undefined}
      onClick={() => onClick?.(notification)}
      className={cn(
        "flex w-full items-start gap-2.5 rounded-md px-2 py-1.5 text-left outline-none transition-colors hover:bg-accent focus-visible:bg-accent focus-visible:ring-2 focus-visible:ring-ring/50",
        className
      )}
    >
      <span
        className={cn(
          "mt-1 flex size-7 shrink-0 items-center justify-center rounded-full",
          notification.read ? "bg-muted text-muted-foreground" : "bg-primary/10 text-primary"
        )}
      >
        <Icon className="size-3.5" aria-hidden="true" />
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="flex items-start justify-between gap-2">
          <span
            className={cn(
              "text-sm",
              notification.read ? "text-muted-foreground" : "font-medium text-foreground"
            )}
          >
            {notification.title}
          </span>
          {!notification.read ? (
            <span aria-hidden="true" className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
          ) : null}
        </span>
        {notification.description ? (
          <span className="line-clamp-2 text-xs text-muted-foreground">{notification.description}</span>
        ) : null}
        <time className="text-xs text-muted-foreground" dateTime={new Date(notification.timestamp).toISOString()}>
          {formatRelativeTime(notification.timestamp)}
        </time>
      </span>
    </button>
  );
}

export { NotificationItem };
