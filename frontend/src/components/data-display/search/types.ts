import type * as React from "react";
import type { DisplaySize } from "@/components/data-display/shared/types";

export interface GlobalSearchInputProps {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  /** Fires with the debounced value — prefer this over `onChange` for queries. */
  onSearch?: (value: string) => void;
  debounceMs?: number;
  placeholder?: string;
  disabled?: boolean;
  loading?: boolean;
  size?: DisplaySize;
  className?: string;
  id?: string;
  /** Accessible name. @default "Search" */
  label?: string;
  /**
   * Single-key focus shortcut when the user isn't typing in another field.
   * Pass `null` to disable. @default "/"
   */
  shortcut?: string | null;
  autoFocus?: boolean;
}

export interface SearchResultItemProps {
  icon?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  category?: React.ReactNode;
  /** Highlights the row as the keyboard-focused result. */
  active?: boolean;
  onSelect?: () => void;
  className?: string;
  href?: string;
}
