"use client";

import * as React from "react";

import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { AppPopoverProps } from "./types";

/**
 * Opinionated popover for filters, settings, and quick forms.
 */
function AppPopover({
  trigger,
  children,
  title,
  description,
  open,
  onOpenChange,
  side = "bottom",
  align = "start",
  className,
}: AppPopoverProps) {
  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger render={trigger} />
      <PopoverContent side={side} align={align} className={className}>
        {title || description ? (
          <PopoverHeader>
            {title ? <PopoverTitle>{title}</PopoverTitle> : null}
            {description ? <PopoverDescription>{description}</PopoverDescription> : null}
          </PopoverHeader>
        ) : null}
        {children}
      </PopoverContent>
    </Popover>
  );
}

export { AppPopover };
