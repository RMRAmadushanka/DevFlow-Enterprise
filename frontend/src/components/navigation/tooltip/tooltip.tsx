"use client";

import * as React from "react";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { AppTooltipProps } from "./types";

/**
 * Convenience tooltip — wraps a single child with provider + content.
 * For many tooltips on a page, wrap once in `TooltipProvider` and use the
 * ui primitives directly.
 */
function AppTooltip({
  content,
  children,
  side = "top",
  align = "center",
  delay = 300,
  disabled,
  className,
}: AppTooltipProps) {
  if (disabled) return children;

  return (
    <TooltipProvider delay={delay}>
      <Tooltip>
        <TooltipTrigger render={children} />
        <TooltipContent side={side} align={align} className={className}>
          {content}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export { AppTooltip };
