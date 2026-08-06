import type { LucideIcon } from "lucide-react";

export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: LucideIcon;
}

export interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  /** Collapse middle items into a "…" menu. Set 0 to disable. @default 4 */
  maxVisible?: number;
  className?: string;
}
