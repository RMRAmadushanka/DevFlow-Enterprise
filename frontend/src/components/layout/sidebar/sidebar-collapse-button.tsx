"use client";

import { PanelLeftClose, PanelLeftOpen } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { iconSize } from "@/design-system/tokens/icons";

export interface SidebarCollapseButtonProps {
  collapsed: boolean;
  onToggle: () => void;
  className?: string;
}

/**
 * Toggles the desktop sidebar between expanded (icon + text) and
 * collapsed (icon only) states. Not rendered on mobile — the drawer has
 * its own close affordance.
 */
export function SidebarCollapseButton({ collapsed, onToggle, className }: SidebarCollapseButtonProps) {
  const button = (
    <Button
      variant="ghost"
      size={collapsed ? "icon-sm" : "sm"}
      onClick={onToggle}
      aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      aria-pressed={collapsed}
      className={cn("w-full justify-center gap-2", !collapsed && "justify-start", className)}
    >
      {collapsed ? <PanelLeftOpen size={iconSize.sm} /> : <PanelLeftClose size={iconSize.sm} />}
      {!collapsed && <span>Collapse</span>}
    </Button>
  );

  if (!collapsed) return button;

  return (
    <Tooltip>
      <TooltipTrigger render={button} />
      <TooltipContent side="right">Expand sidebar</TooltipContent>
    </Tooltip>
  );
}
