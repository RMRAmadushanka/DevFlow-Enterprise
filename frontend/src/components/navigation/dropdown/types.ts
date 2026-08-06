import type * as React from "react";

export interface DropdownItem {
  id: string;
  label: React.ReactNode;
  icon?: React.ReactNode;
  shortcut?: string;
  disabled?: boolean;
  destructive?: boolean;
  separator?: boolean;
  onSelect?: () => void;
}

export interface DropdownGroup {
  id: string;
  heading?: string;
  items: DropdownItem[];
}

export interface AppDropdownMenuProps {
  trigger: React.ReactElement;
  items?: DropdownItem[];
  groups?: DropdownGroup[];
  align?: "start" | "center" | "end";
  side?: "top" | "bottom" | "left" | "right";
  label?: React.ReactNode;
  className?: string;
}
