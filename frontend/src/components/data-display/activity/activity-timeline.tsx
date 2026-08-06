"use client";

import * as React from "react";
import { motion } from "framer-motion";

import { cn } from "@/lib/utils";
import { UserAvatar } from "@/components/data-display/avatars";
import { EmptyState } from "@/components/data-display/empty-state";
import { SkeletonAvatar, SkeletonText } from "@/components/data-display/skeleton";
import { formatRelativeTime } from "@/components/data-display/shared/formatters";
import { duration, easing } from "@/design-system/tokens/motion";
import type { ActivityTimelineProps } from "./types";

/**
 * Activity / audit feed — avatar, action copy, relative timestamp.
 * Used for project history, deployments, and audit logs.
 */
function ActivityTimeline({
  items,
  density = "comfortable",
  loading,
  empty,
  className,
  label = "Activity",
}: ActivityTimelineProps) {
  if (loading) {
    return (
      <div
        data-slot="activity-timeline"
        aria-busy="true"
        aria-label={label}
        className={cn("flex flex-col", className)}
      >
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className={cn(
              "flex gap-3 border-b border-border last:border-b-0",
              density === "compact" ? "py-2" : "py-3"
            )}
          >
            <SkeletonAvatar size="sm" />
            <div className="flex-1">
              <SkeletonText lines={2} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return empty ?? <EmptyState variant="no-data" title="No activity yet" className={className} />;
  }

  return (
    <ol
      data-slot="activity-timeline"
      aria-label={label}
      className={cn("relative flex flex-col", className)}
    >
      {items.map((item, index) => (
        <motion.li
          key={item.id}
          initial={{ opacity: 0, y: 3 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: duration.fast,
            ease: easing.decelerate,
            delay: Math.min(index, 8) * 0.03,
          }}
          className={cn(
            "relative flex gap-3 border-b border-border last:border-b-0",
            density === "compact" ? "py-2" : "py-3"
          )}
        >
          {item.user ? (
            <UserAvatar user={item.user} size="sm" />
          ) : item.icon ? (
            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground [&>svg]:size-3.5">
              {item.icon}
            </span>
          ) : (
            <span className="mt-2 size-2 shrink-0 rounded-full bg-muted-foreground" aria-hidden="true" />
          )}

          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <p className="text-sm text-foreground">
              {item.user ? <span className="font-medium">{item.user.name} </span> : null}
              <span className="text-muted-foreground">{item.action}</span>
            </p>
            {item.description ? (
              <p className="text-xs text-muted-foreground">{item.description}</p>
            ) : null}
            <div className="flex flex-wrap items-center gap-2">
              <time
                className="text-xs text-muted-foreground"
                dateTime={new Date(item.timestamp).toISOString()}
              >
                {formatRelativeTime(item.timestamp)}
              </time>
              {item.meta}
            </div>
          </div>
        </motion.li>
      ))}
    </ol>
  );
}

export { ActivityTimeline };
