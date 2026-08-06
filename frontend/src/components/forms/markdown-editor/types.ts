import type { BaseFieldProps } from "@/components/forms/shared/types";

export type MarkdownEditorMode = "edit" | "preview" | "split";

export interface MarkdownEditorProps extends Omit<BaseFieldProps, "loading"> {
  value?: string;
  defaultValue?: string;
  onValueChange?: (markdown: string) => void;
  placeholder?: string;
  /** @default 240 */
  minHeight?: number;
  /** @default "edit" */
  defaultMode?: MarkdownEditorMode;
}
