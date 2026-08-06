import type * as React from "react";
import type { DropdownGroup, DropdownItem } from "@/components/navigation/dropdown/types";

export interface AppContextMenuProps {
  children: React.ReactElement;
  items?: DropdownItem[];
  groups?: DropdownGroup[];
  label?: React.ReactNode;
  className?: string;
}
