"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";

import { cn } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, CardAction } from "@/components/ui/card";
import { SkeletonCard } from "@/components/data-display/skeleton";
import { duration, easing } from "@/design-system/tokens/motion";
import type { DataCardProps } from "./types";

/**
 * A generic, prop-driven summary card — used across the product for
 * projects, teams, deployments, or any other card-shaped record. Four
 * variants cover the interaction spectrum from purely static (`default`)
 * to a toggleable multi-select tile (`selectable`).
 *
 * `selectable`/`interactive` cards are a *single* focusable element (the
 * card itself carries `role="checkbox"`/`role="button"`) — the visual
 * checkmark is decorative, not a second nested control (WCAG 4.1.2).
 */
function DataCard({
  variant = "default",
  icon,
  media,
  title,
  description,
  badge,
  children,
  footer,
  selected = false,
  onSelectedChange,
  onClick,
  disabled,
  loading,
  className,
}: DataCardProps) {
  const isSelectable = variant === "selectable";
  const isInteractive = variant === "interactive" || isSelectable;
  const isCompact = variant === "compact";

  function activate() {
    if (disabled) return;
    if (isSelectable) onSelectedChange?.(!selected);
    else onClick?.();
  }

  function handleKeyDown(event: React.KeyboardEvent) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      activate();
    }
  }

  if (loading) {
    return <SkeletonCard className={className} showAvatar={!!icon} showImage={!!media} />;
  }

  return (
    <motion.div
      whileHover={isInteractive && !disabled ? { y: -2 } : undefined}
      whileTap={isInteractive && !disabled ? { scale: 0.99 } : undefined}
      transition={{ duration: duration.fast, ease: easing.standard }}
    >
      <Card
        data-slot="data-card"
        data-selected={isSelectable ? selected || undefined : undefined}
        data-disabled={disabled || undefined}
        size={isCompact ? "sm" : "default"}
        role={isSelectable ? "checkbox" : isInteractive ? "button" : undefined}
        aria-checked={isSelectable ? selected : undefined}
        aria-disabled={disabled || undefined}
        tabIndex={isInteractive && !disabled ? 0 : undefined}
        onClick={isInteractive ? activate : undefined}
        onKeyDown={isInteractive ? handleKeyDown : undefined}
        className={cn(
          "transition-colors",
          isInteractive && "cursor-pointer outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
          isInteractive && !disabled && "hover:ring-foreground/20",
          isSelectable && selected && "ring-2 ring-primary",
          disabled && "pointer-events-none opacity-50",
          className
        )}
      >
        {media ? <div className="overflow-hidden">{media}</div> : null}
        <CardHeader className={cn(isCompact && "px-3")}>
          <div className="flex items-start gap-3">
            {icon ? <div className="shrink-0">{icon}</div> : null}
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <CardTitle className="truncate">{title}</CardTitle>
              {description ? <CardDescription className="line-clamp-2">{description}</CardDescription> : null}
            </div>
          </div>
          {badge || isSelectable ? (
            <CardAction className="flex items-center gap-2">
              {badge}
              {isSelectable ? (
                <span
                  aria-hidden="true"
                  className={cn(
                    "flex size-4 shrink-0 items-center justify-center rounded-[4px] border border-input transition-colors",
                    selected && "border-primary bg-primary text-primary-foreground"
                  )}
                >
                  {selected ? <Check className="size-3" /> : null}
                </span>
              ) : null}
            </CardAction>
          ) : null}
        </CardHeader>
        {children ? <CardContent className={cn(isCompact && "px-3")}>{children}</CardContent> : null}
        {footer ? <CardFooter className={cn(isCompact && "px-3")}>{footer}</CardFooter> : null}
      </Card>
    </motion.div>
  );
}

export { DataCard };
