import type { Locale } from "date-fns";
import type { BaseFieldProps } from "@/components/forms/shared/types";

export interface DatePickerFieldProps extends BaseFieldProps {
  value?: Date | null;
  defaultValue?: Date | null;
  onValueChange?: (date: Date | null) => void;
  placeholder?: string;
  minDate?: Date;
  maxDate?: Date;
  disabledDates?: Date[] | ((date: Date) => boolean);
  /** A `date-fns` locale, e.g. `import { fr } from "date-fns/locale"`. */
  locale?: Locale;
  /** @default (date) => date.toLocaleDateString() */
  formatDate?: (date: Date) => string;
}
