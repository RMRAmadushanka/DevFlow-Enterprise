import * as React from "react";

import { cn } from "@/lib/utils";
import type { NotificationBadgeProps } from "./types";

/** Unread count pill for bells / nav items. Hidden when count is 0. */
function NotificationBadge({ count, max = 99, className }: NotificationBadgeProps) {
  if (count <= 0) return null;
  const label = count > max ? `${max}+` : String(count);

  return (
    <span
      data-slot="notification-badge"
      className={cn(
        "inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[0.625rem] font-semibold text-destructive-foreground",
        className
      )}
    >
      <span className="sr-only">{count} unread</span>
      <span aria-hidden="true">{label}</span>
    </span>
  );
}

export { NotificationBadge };
