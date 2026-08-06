import type { BaseFieldProps } from "@/components/forms/shared/types";
import type { SelectOption } from "@/components/forms/shared/option-types";

export interface AutocompleteFieldProps extends BaseFieldProps {
  /** The raw text value — unlike `ComboboxField`, the value is always freeform text, not required to match a suggestion. */
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  /** Called when the user picks a suggestion from the dropdown. */
  onSelectSuggestion?: (suggestion: SelectOption) => void;
  /** Debounced with the current text — return matching suggestions. */
  fetchSuggestions: (query: string) => Promise<SelectOption[]>;
  debounceMs?: number;
  placeholder?: string;
  emptyText?: string;
  /** Minimum characters before suggestions are fetched. @default 1 */
  minChars?: number;
}
