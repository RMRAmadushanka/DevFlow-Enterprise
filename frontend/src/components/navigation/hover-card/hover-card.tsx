"use client";

import * as React from "react";

import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import type { AppHoverCardProps, PreviewHoverCardProps } from "./types";

/**
 * Hover preview surface — for free-form content use this; for user/project
 * previews prefer `PreviewHoverCard`.
 */
function AppHoverCard({
  trigger,
  children,
  openDelay = 400,
  closeDelay = 200,
  side = "bottom",
  align = "center",
  className,
}: AppHoverCardProps) {
  return (
    <HoverCard>
      <HoverCardTrigger render={trigger} delay={openDelay} closeDelay={closeDelay} />
      <HoverCardContent side={side} align={align} className={className}>
        {children}
      </HoverCardContent>
    </HoverCard>
  );
}

/**
 * Structured hover preview with avatar, title, description, and metadata.
 */
function PreviewHoverCard({
  trigger,
  avatar,
  title,
  description,
  meta,
  footer,
  side = "bottom",
  className,
}: PreviewHoverCardProps) {
  return (
    <AppHoverCard trigger={trigger} side={side} className={className}>
      <div className="flex flex-col gap-3">
        <div className="flex items-start gap-3">
          {avatar}
          <div className="flex min-w-0 flex-col gap-0.5">
            <p className="truncate text-sm font-medium text-foreground">{title}</p>
            {description ? (
              <p className="line-clamp-2 text-xs text-muted-foreground">{description}</p>
            ) : null}
          </div>
        </div>
        {meta ? <div className="text-xs text-muted-foreground">{meta}</div> : null}
        {footer}
      </div>
    </AppHoverCard>
  );
}

export { AppHoverCard, PreviewHoverCard };
