import type { LucideIcon } from "lucide-react";

export interface CommandPaletteAction {
  id: string;
  label: string;
  icon?: LucideIcon;
  shortcut?: string;
  keywords?: string[];
  onSelect: () => void;
}

export interface CommandPaletteGroup {
  id: string;
  heading: string;
  actions: CommandPaletteAction[];
}

export interface CommandPaletteProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  groups: CommandPaletteGroup[];
  placeholder?: string;
  /**
   * Register Cmd/Ctrl+K to toggle. When using inside `AppShell`, prefer the
   * layout `CommandMenu` which shares open state via the layout store.
   * @default true
   */
  enableShortcut?: boolean;
  /** Recent actions shown above groups when provided. */
  recent?: CommandPaletteAction[];
}
