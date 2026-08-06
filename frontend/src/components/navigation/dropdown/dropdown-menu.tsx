"use client";

import * as React from "react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { AppDropdownMenuProps, DropdownItem } from "./types";

function renderItem(item: DropdownItem) {
  if (item.separator) {
    return <DropdownMenuSeparator key={item.id} />;
  }

  return (
    <DropdownMenuItem
      key={item.id}
      disabled={item.disabled}
      variant={item.destructive ? "destructive" : "default"}
      onClick={item.onSelect}
    >
      {item.icon}
      <span>{item.label}</span>
      {item.shortcut ? <DropdownMenuShortcut>{item.shortcut}</DropdownMenuShortcut> : null}
    </DropdownMenuItem>
  );
}

/**
 * Opinionated dropdown for action menus — items or groups with icons and
 * shortcuts. Re-exports the ui primitives for free-form composition.
 */
function AppDropdownMenu({
  trigger,
  items = [],
  groups,
  align = "end",
  side = "bottom",
  label,
  className,
}: AppDropdownMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={trigger} />
      <DropdownMenuContent align={align} side={side} className={className}>
        {label ? (
          <>
            <DropdownMenuGroup>
              <DropdownMenuLabel>{label}</DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
          </>
        ) : null}
        {groups
          ? groups.map((group, index) => (
              <React.Fragment key={group.id}>
                {index > 0 ? <DropdownMenuSeparator /> : null}
                <DropdownMenuGroup>
                  {group.heading ? <DropdownMenuLabel>{group.heading}</DropdownMenuLabel> : null}
                  {group.items.map(renderItem)}
                </DropdownMenuGroup>
              </React.Fragment>
            ))
          : items.map(renderItem)}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export { AppDropdownMenu };
