import type { BaseFieldProps } from "@/components/forms/shared/types";

export interface OTPFieldProps extends Omit<BaseFieldProps, "loading"> {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** Fired once every slot is filled. */
  onComplete?: (value: string) => void;
  /** @default 6 */
  length?: number;
  /** Renders `•` instead of the entered character (e.g. for numeric PINs). */
  mask?: boolean;
  /** Inserts a visual separator after these 1-based slot positions, e.g. `[3]` for "123 456". */
  groupAfter?: number[];
  autoFocus?: boolean;
}
