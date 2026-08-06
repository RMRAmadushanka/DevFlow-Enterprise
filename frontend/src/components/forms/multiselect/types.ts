import type { BaseFieldProps } from "@/components/forms/shared/types";
import type { SelectOptionsInput } from "@/components/forms/shared/option-types";

export interface MultiSelectFieldProps<TValue extends string = string> extends BaseFieldProps {
  options: SelectOptionsInput<TValue>;
  value?: TValue[];
  defaultValue?: TValue[];
  onValueChange?: (value: TValue[]) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  /** Disables further selection once this many options are chosen. */
  maxSelected?: number;
  /** Shows a "Select all" row at the top of the (currently filtered) list. */
  showSelectAll?: boolean;
}
