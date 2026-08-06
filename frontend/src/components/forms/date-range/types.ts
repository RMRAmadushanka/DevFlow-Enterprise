import type { Locale } from "date-fns";
import type { BaseFieldProps } from "@/components/forms/shared/types";

export interface DateRange {
  from: Date | undefined;
  to?: Date | undefined;
}

export interface DateRangePreset {
  label: string;
  getValue: () => DateRange;
}

export interface DateRangePickerFieldProps extends BaseFieldProps {
  value?: DateRange | null;
  defaultValue?: DateRange | null;
  onValueChange?: (range: DateRange | null) => void;
  placeholder?: string;
  minDate?: Date;
  maxDate?: Date;
  disabledDates?: Date[] | ((date: Date) => boolean);
  locale?: Locale;
  formatDate?: (date: Date) => string;
  /** @default defaultDateRangePresets ("Today", "Yesterday", "Last 7 days", "This month") */
  presets?: DateRangePreset[] | false;
}
