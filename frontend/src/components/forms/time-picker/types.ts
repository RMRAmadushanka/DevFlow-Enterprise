import type { BaseFieldProps } from "@/components/forms/shared/types";

export interface TimeValue {
  hours: number;
  minutes: number;
  seconds?: number;
}

export interface TimePickerFieldProps extends BaseFieldProps {
  value?: TimeValue | null;
  defaultValue?: TimeValue | null;
  onValueChange?: (time: TimeValue | null) => void;
  /** @default "24" */
  hourFormat?: "12" | "24";
  showSeconds?: boolean;
  minuteStep?: number;
}
