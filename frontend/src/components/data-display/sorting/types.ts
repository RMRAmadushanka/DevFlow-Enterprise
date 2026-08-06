import type { DisplayOption } from "@/components/data-display/shared/types";

export type SortDirection = "asc" | "desc";

export interface SortRule<TField extends string = string> {
  field: TField;
  direction: SortDirection;
}

export interface SortDropdownProps<TField extends string = string> {
  /** Fields the user can sort by. */
  fields: DisplayOption<TField>[];
  value?: SortRule<TField>[];
  defaultValue?: SortRule<TField>[];
  onValueChange?: (rules: SortRule<TField>[]) => void;
  /**
   * Allow stacking multiple sort rules (e.g. Created ↓ then Priority ↑).
   * When false, selecting a field replaces the current rule. @default true
   */
  multi?: boolean;
  /** Trigger label. @default "Sort" */
  label?: string;
  disabled?: boolean;
  className?: string;
}
