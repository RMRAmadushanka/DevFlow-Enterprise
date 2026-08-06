import type { BaseFieldProps } from "@/components/forms/shared/types";

export interface IconPickerFieldProps extends Omit<BaseFieldProps, "loading"> {
  /** The picked icon's catalog name, e.g. `"Bell"`. */
  value?: string | null;
  defaultValue?: string | null;
  onValueChange?: (iconName: string | null) => void;
  placeholder?: string;
  clearable?: boolean;
}
