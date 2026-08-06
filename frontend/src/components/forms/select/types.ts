import type { BaseFieldProps } from "@/components/forms/shared/types";
import type { SelectOptionsInput } from "@/components/forms/shared/option-types";

export interface SelectFieldProps<TValue extends string = string> extends BaseFieldProps {
  options: SelectOptionsInput<TValue>;
  value?: TValue | null;
  defaultValue?: TValue | null;
  onValueChange?: (value: TValue | null) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  /** Shows an "x" to clear the current selection back to `null`. */
  clearable?: boolean;
}
