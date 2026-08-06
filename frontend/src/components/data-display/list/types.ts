import type * as React from "react";
import type { Density } from "@/components/data-display/shared/types";

export interface DataListItemData {
  id: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  icon?: React.ReactNode;
  meta?: React.ReactNode;
  trailing?: React.ReactNode;
  disabled?: boolean;
}

export interface DataListProps {
  items: DataListItemData[];
  density?: Density;
  loading?: boolean;
  empty?: React.ReactNode;
  onItemSelect?: (id: string) => void;
  className?: string;
  /** Accessible name for the list. */
  label?: string;
}

export interface DataListItemProps extends DataListItemData {
  density?: Density;
  onSelect?: () => void;
  className?: string;
}
