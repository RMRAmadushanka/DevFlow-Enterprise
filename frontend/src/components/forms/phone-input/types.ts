import type { BaseFieldProps } from "@/components/forms/shared/types";

export interface PhoneInputProps extends BaseFieldProps {
  /** Full E.164 value, e.g. `"+14155551234"`. */
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** ISO 3166-1 alpha-2 code used when `value`/`defaultValue` don't resolve to a known dial code. @default "US" */
  defaultCountry?: string;
  placeholder?: string;
}
