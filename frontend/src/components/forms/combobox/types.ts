import type { BaseFieldProps } from "@/components/forms/shared/types";
import type { SelectOption } from "@/components/forms/shared/option-types";

export interface ComboboxFieldProps<TValue extends string = string> extends BaseFieldProps {
  value?: TValue | null;
  defaultValue?: TValue | null;
  onValueChange?: (value: TValue | null, option: SelectOption<TValue> | null) => void;
  /** Static option list. Omit and provide `loadOptions` for async/server-driven results. */
  options?: SelectOption<TValue>[];
  /** Called (debounced) with the current search query — return the matching options. */
  loadOptions?: (query: string) => Promise<SelectOption<TValue>[]>;
  debounceMs?: number;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  loadingText?: string;
}
