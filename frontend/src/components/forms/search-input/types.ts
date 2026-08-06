import type * as React from "react";
import type { FieldSize } from "@/components/forms/shared/types";

export interface SearchInputProps {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  /** Debounced value changes — pairs well with server-side search. */
  onSearch?: (value: string) => void;
  debounceMs?: number;
  placeholder?: string;
  disabled?: boolean;
  loading?: boolean;
  size?: FieldSize;
  className?: string;
  id?: string;
  name?: string;
  /** Accessible label — not visually rendered (search inputs are typically unlabeled chrome). @default "Search" */
  label?: string;
  /**
   * Global keyboard shortcut that focuses this input when nothing else is
   * focused (skips when the user is already typing elsewhere). Pass
   * `false` to disable. @default "/"
   */
  shortcut?: string | false;
  autoFocus?: boolean;
  inputRef?: React.Ref<HTMLInputElement>;
}
