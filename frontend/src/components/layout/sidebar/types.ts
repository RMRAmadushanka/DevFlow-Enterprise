import type { LucideIcon } from "lucide-react";

/** A single navigation entry in the sidebar. */
export interface NavItem {
  /** Stable identifier — used as the React key and for active-state matching. */
  id: string;
  label: string;
  href: string;
  icon: LucideIcon;
  /** Optional count/status badge rendered at the end of the item. */
  badge?: string | number;
  disabled?: boolean;
  /** External links open in a new tab and skip Next.js client routing. */
  external?: boolean;
}

/** A labeled group of nav items, e.g. "WORKSPACE" or "SYSTEM". */
export interface NavGroup {
  id: string;
  /** Omit for an unlabeled top group. */
  label?: string;
  items: NavItem[];
}
