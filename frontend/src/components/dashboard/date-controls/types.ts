import type { DateRangePreset, DateRangeValue } from "@/components/dashboard/shared/types";

export interface DateRangeSelectorProps {
  value: DateRangeValue;
  onChange: (value: DateRangeValue) => void;
  /** Which presets to show. */
  presets?: DateRangePreset[];
  className?: string;
  disabled?: boolean;
  /** Accessible label. @default "Date range" */
  label?: string;
  /** When true, shows simple from/to date inputs for custom range. @default true */
  allowCustom?: boolean;
}
