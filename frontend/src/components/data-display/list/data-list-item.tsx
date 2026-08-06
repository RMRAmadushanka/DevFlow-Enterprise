"use client";

import * as React from "react";
import { motion } from "framer-motion";

import { cn } from "@/lib/utils";
import { duration, easing } from "@/design-system/tokens/motion";
import type { DataListItemProps } from "./types";

/** A single row in a `DataList` — icon, title/description, meta, trailing slot. */
function DataListItem({
  title,
  description,
  icon,
  meta,
  trailing,
  disabled,
  density = "comfortable",
  onSelect,
  className,
}: DataListItemProps) {
  const interactive = !!onSelect && !disabled;

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 2 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: duration.fast, ease: easing.decelerate }}
      data-slot="data-list-item"
      data-density={density}
      className={cn(
        "flex items-start gap-3 border-b border-border last:border-b-0",
        density === "compact" ? "px-3 py-2" : "px-4 py-3",
        interactive &&
          "cursor-pointer outline-none transition-colors hover:bg-muted/50 focus-visible:bg-muted/50 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring/50",
        disabled && "pointer-events-none opacity-50",
        className
      )}
      role={interactive ? "button" : undefined}
      tabIndex={interactive ? 0 : undefined}
      aria-disabled={disabled || undefined}
      onClick={interactive ? onSelect : undefined}
      onKeyDown={
        interactive
          ? (event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onSelect?.();
              }
            }
          : undefined
      }
    >
      {icon ? (
        <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground [&>svg]:size-4">
          {icon}
        </span>
      ) : null}
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <div className="flex items-start justify-between gap-3">
          <p className="truncate text-sm font-medium text-foreground">{title}</p>
          {meta ? <span className="shrink-0 text-xs text-muted-foreground">{meta}</span> : null}
        </div>
        {description ? (
          <p className="line-clamp-2 text-xs text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {trailing ? <div className="shrink-0 self-center">{trailing}</div> : null}
    </motion.li>
  );
}

export { DataListItem };
