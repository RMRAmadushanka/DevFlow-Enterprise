"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/data-display/empty-state";
import { useControllableState } from "@/components/data-display/shared/hooks";
import { NotificationGroup } from "./notification-group";
import { NotificationItem } from "./notification-item";
import type { NotificationFilter, NotificationPanelProps } from "./types";

/**
 * Reusable notification list surface — filter tabs, mark-all-read / clear,
 * and grouped items. Prop-driven; no store or API.
 */
function NotificationPanel({
  notifications,
  filter,
  onFilterChange,
  onNotificationClick,
  onMarkAllRead,
  onClearAll,
  empty,
  className,
  label = "Notifications",
}: NotificationPanelProps) {
  const [activeFilter, setActiveFilter] = useControllableState<NotificationFilter>({
    value: filter,
    defaultValue: "all",
    onChange: onFilterChange,
  });

  const visible = notifications.filter((item) =>
    activeFilter === "unread" ? !item.read : true
  );

  const grouped = React.useMemo(() => {
    const map = new Map<string, typeof visible>();
    for (const item of visible) {
      const key = item.category ?? "Recent";
      const list = map.get(key) ?? [];
      list.push(item);
      map.set(key, list);
    }
    return map;
  }, [visible]);

  return (
    <div
      data-slot="notification-panel"
      aria-label={label}
      className={cn("flex w-full flex-col", className)}
    >
      <div className="flex items-center justify-between gap-2 border-b border-border px-3 py-2">
        <div className="flex items-center gap-1" role="tablist" aria-label="Filter notifications">
          {(["all", "unread"] as const).map((value) => (
            <Button
              key={value}
              type="button"
              role="tab"
              aria-selected={activeFilter === value}
              size="sm"
              variant={activeFilter === value ? "secondary" : "ghost"}
              onClick={() => setActiveFilter(value)}
              className="capitalize"
            >
              {value}
            </Button>
          ))}
        </div>
        <div className="flex items-center gap-1">
          {onMarkAllRead ? (
            <Button type="button" variant="ghost" size="sm" onClick={onMarkAllRead}>
              Mark all read
            </Button>
          ) : null}
          {onClearAll ? (
            <Button type="button" variant="ghost" size="sm" onClick={onClearAll}>
              Clear all
            </Button>
          ) : null}
        </div>
      </div>

      <div className="max-h-80 overflow-y-auto p-2">
        {visible.length === 0 ? (
          empty ?? <EmptyState variant="no-data" title="You're all caught up" description="No notifications to show." />
        ) : (
          <div className="flex flex-col gap-3">
            {[...grouped.entries()].map(([heading, items]) => (
              <NotificationGroup key={heading} heading={heading}>
                {items.map((item) => (
                  <NotificationItem
                    key={item.id}
                    notification={item}
                    onClick={onNotificationClick}
                  />
                ))}
              </NotificationGroup>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export { NotificationPanel };
