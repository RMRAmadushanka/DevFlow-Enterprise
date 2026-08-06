import type { BaseFieldProps } from "@/components/forms/shared/types";

export interface CurrencyInputProps extends BaseFieldProps {
  value?: number | null;
  defaultValue?: number | null;
  onValueChange?: (value: number | null) => void;
  /** ISO 4217 currency code. @default "USD" */
  currencyCode?: string;
  /** BCP 47 locale tag, e.g. `"de-DE"`. @default the browser's locale */
  locale?: string;
  min?: number;
  max?: number;
  allowNegative?: boolean;
  placeholder?: string;
}
