import type { BaseFieldProps } from "@/components/forms/shared/types";

export interface TagsInputProps extends BaseFieldProps {
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (tags: string[]) => void;
  /** Static suggestion list shown (filtered by the current input) as tags are typed. */
  suggestions?: string[];
  maxTags?: number;
  placeholder?: string;
  allowDuplicates?: boolean;
}
