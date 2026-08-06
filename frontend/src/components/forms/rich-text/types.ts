import type { BaseFieldProps } from "@/components/forms/shared/types";

export interface RichTextEditorProps extends Omit<BaseFieldProps, "loading"> {
  /** Sanitized HTML string. */
  value?: string;
  defaultValue?: string;
  onValueChange?: (html: string) => void;
  placeholder?: string;
  /** @default 160 */
  minHeight?: number;
}
