"use client";

import * as React from "react";

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import type { DropdownItem } from "@/components/navigation/dropdown/types";
import type { AppContextMenuProps } from "./types";

function renderItem(item: DropdownItem) {
  if (item.separator) {
    return <ContextMenuSeparator key={item.id} />;
  }

  return (
    <ContextMenuItem
      key={item.id}
      disabled={item.disabled}
      variant={item.destructive ? "destructive" : "default"}
      onClick={item.onSelect}
    >
      {item.icon}
      <span>{item.label}</span>
      {item.shortcut ? <ContextMenuShortcut>{item.shortcut}</ContextMenuShortcut> : null}
    </ContextMenuItem>
  );
}

/**
 * Right-click / long-press menu for table rows, cards, and canvas items.
 */
function AppContextMenu({ children, items = [], groups, label, className }: AppContextMenuProps) {
  return (
    <ContextMenu>
      <ContextMenuTrigger render={children} />
      <ContextMenuContent className={className}>
        {label ? (
          <>
            <ContextMenuGroup>
              <ContextMenuLabel>{label}</ContextMenuLabel>
            </ContextMenuGroup>
            <ContextMenuSeparator />
          </>
        ) : null}
        {groups
          ? groups.map((group, index) => (
              <React.Fragment key={group.id}>
                {index > 0 ? <ContextMenuSeparator /> : null}
                <ContextMenuGroup>
                  {group.heading ? <ContextMenuLabel>{group.heading}</ContextMenuLabel> : null}
                  {group.items.map(renderItem)}
                </ContextMenuGroup>
              </React.Fragment>
            ))
          : items.map(renderItem)}
      </ContextMenuContent>
    </ContextMenu>
  );
}

export { AppContextMenu };
