import type { LucideIcon } from "lucide-react";

export interface NotificationItem {
  id: string;
  title: string;
  description?: string;
  /** ISO string or Date — rendered as a relative time ("2h ago"). */
  timestamp: string | Date;
  read: boolean;
  icon?: LucideIcon;
  href?: string;
}
