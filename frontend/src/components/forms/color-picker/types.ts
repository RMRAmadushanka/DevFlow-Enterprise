import type { BaseFieldProps } from "@/components/forms/shared/types";

export interface ColorPickerFieldProps extends Omit<BaseFieldProps, "loading"> {
  /** Hex color, e.g. `"#3B82F6"`. */
  value?: string;
  defaultValue?: string;
  onValueChange?: (hex: string) => void;
  presetColors?: string[];
  /** Persists and surfaces recently-picked colors via `localStorage`. @default true */
  showRecentColors?: boolean;
}
