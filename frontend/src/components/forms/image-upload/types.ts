import type { BaseFieldProps } from "@/components/forms/shared/types";

export interface ImageUploadFieldProps extends Omit<BaseFieldProps, "loading"> {
  /** Current image — a URL (already-uploaded image) or a local `File` (freshly selected, not yet uploaded). */
  value?: string | File | null;
  defaultValue?: string | File | null;
  onValueChange?: (file: File | null) => void;
  accept?: string;
  maxSizeBytes?: number;
  /** @default "square" */
  shape?: "square" | "circle";
  /** Pixel size of the preview. @default 96 */
  previewSize?: number;
  /**
   * Renders a "Crop" affordance on the preview. This system doesn't ship a
   * cropping library — wire this to open your own cropper (e.g. a modal)
   * and call back with the cropped `File`.
   */
  onCropRequested?: (file: File) => void;
}
