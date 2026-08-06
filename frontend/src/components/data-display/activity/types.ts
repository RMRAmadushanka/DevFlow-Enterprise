import type * as React from "react";
import type { AvatarUser } from "@/components/data-display/avatars/types";
import type { Density } from "@/components/data-display/shared/types";

export interface ActivityItem {
  id: string;
  user?: AvatarUser;
  /** Primary action copy, e.g. "deployed v2.1". */
  action: React.ReactNode;
  description?: React.ReactNode;
  timestamp: Date | string | number;
  icon?: React.ReactNode;
  meta?: React.ReactNode;
}

export interface ActivityTimelineProps {
  items: ActivityItem[];
  density?: Density;
  loading?: boolean;
  empty?: React.ReactNode;
  className?: string;
  label?: string;
}
