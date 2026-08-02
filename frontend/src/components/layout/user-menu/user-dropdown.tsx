"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import {
  Check,
  ChevronsUpDown,
  CreditCard,
  LogOut,
  Monitor,
  Moon,
  Settings,
  Sun,
  UserCircle,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { iconSize } from "@/design-system/tokens/icons";
import type { AppUser } from "./types";

export interface UserDropdownProps {
  user: AppUser;
  /** "full" shows avatar + name + chevron (expanded sidebar). "compact" is avatar-only (navbar, collapsed rail). */
  variant?: "full" | "compact";
  align?: "start" | "center" | "end";
  side?: "top" | "right" | "bottom" | "left";
  onProfileClick?: () => void;
  onAccountSettingsClick?: () => void;
  onBillingClick?: () => void;
  onLogout?: () => void;
  className?: string;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  const initials = parts.slice(0, 2).map((part) => part[0]?.toUpperCase() ?? "");
  return initials.join("") || "U";
}

/**
 * User account menu — profile, account settings, theme switch, logout.
 * Used both in the sidebar footer (variant="full"/"compact" depending on
 * collapse state) and the navbar (variant="compact").
 */
export function UserDropdown({
  user,
  variant = "full",
  align = "end",
  side = "top",
  onProfileClick,
  onAccountSettingsClick,
  onBillingClick,
  onLogout,
  className,
}: UserDropdownProps) {
  const { theme, setTheme } = useTheme();

  const trigger =
    variant === "full" ? (
      <Button
        variant="ghost"
        className={cn("h-auto w-full justify-start gap-2 px-2 py-1.5", className)}
        aria-label={`Account menu for ${user.name}`}
      >
        <Avatar className="size-7 shrink-0">
          <AvatarImage src={user.avatarUrl} alt="" />
          <AvatarFallback className="text-[11px]">{getInitials(user.name)}</AvatarFallback>
        </Avatar>
        <span className="flex min-w-0 flex-1 flex-col items-start">
          <span className="w-full truncate text-sm font-medium text-text-primary">{user.name}</span>
          <span className="w-full truncate text-xs text-text-muted">{user.role ?? user.email}</span>
        </span>
        <ChevronsUpDown size={iconSize.xs} className="shrink-0 text-text-muted" />
      </Button>
    ) : (
      <Button
        variant="ghost"
        size="icon"
        className={cn("rounded-full", className)}
        aria-label={`Account menu for ${user.name}`}
      >
        <Avatar className="size-7">
          <AvatarImage src={user.avatarUrl} alt="" />
          <AvatarFallback className="text-[11px]">{getInitials(user.name)}</AvatarFallback>
        </Avatar>
      </Button>
    );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={trigger} />
      <DropdownMenuContent align={align} side={side} className="w-64">
        <div className="flex flex-col gap-0.5 px-2 py-1.5">
          <span className="truncate text-sm font-medium text-text-primary">{user.name}</span>
          <span className="truncate text-xs text-text-muted">{user.email}</span>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={onProfileClick}>
            <UserCircle size={iconSize.xs} /> Profile
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onAccountSettingsClick}>
            <Settings size={iconSize.xs} /> Account settings
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onBillingClick}>
            <CreditCard size={iconSize.xs} /> Billing
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuLabel className="px-2 py-1 text-[11px] font-semibold tracking-wide text-text-muted uppercase">
            Theme
          </DropdownMenuLabel>
          <DropdownMenuItem onClick={() => setTheme("light")}>
            <Sun size={iconSize.xs} /> Light
            {theme === "light" && <Check size={iconSize.xs} className="ml-auto" />}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setTheme("dark")}>
            <Moon size={iconSize.xs} /> Dark
            {theme === "dark" && <Check size={iconSize.xs} className="ml-auto" />}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setTheme("system")}>
            <Monitor size={iconSize.xs} /> System
            {theme === "system" && <Check size={iconSize.xs} className="ml-auto" />}
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onClick={onLogout}>
          <LogOut size={iconSize.xs} /> Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
