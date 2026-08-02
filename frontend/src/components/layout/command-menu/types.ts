import type { LucideIcon } from "lucide-react";

export interface CommandAction {
  id: string;
  label: string;
  icon?: LucideIcon;
  /** Rendered right-aligned, e.g. "⌘K", "G then P". */
  shortcut?: string;
  /** Additional search terms matched against but not displayed. */
  keywords?: string[];
  onSelect: () => void;
}

export interface CommandGroupConfig {
  id: string;
  heading: string;
  actions: CommandAction[];
}
