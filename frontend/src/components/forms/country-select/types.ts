import type { BaseFieldProps } from "@/components/forms/shared/types";

export interface CountrySelectFieldProps extends BaseFieldProps {
  /** ISO 3166-1 alpha-2 code, e.g. `"US"`. */
  value?: string | null;
  defaultValue?: string | null;
  onValueChange?: (iso2: string | null) => void;
  placeholder?: string;
  clearable?: boolean;
}
