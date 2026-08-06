import type { BaseFieldProps } from "@/components/forms/shared/types";

export type UploadStatus = "idle" | "uploading" | "success" | "error" | "cancelled";

export interface UploadFile {
  id: string;
  file: File;
  status: UploadStatus;
  /** 0–100. */
  progress: number;
  error?: string;
  /** Object URL for image previews — revoked automatically when the file is removed. */
  previewUrl?: string;
}

export interface FileUploadFieldProps extends Omit<BaseFieldProps, "loading"> {
  value?: UploadFile[];
  onValueChange?: (files: UploadFile[]) => void;
  /**
   * Performs the actual upload for one file. The component owns UI/state
   * orchestration (progress, cancel, retry) — this callback is the only
   * integration point for real network code, kept fully optional so the
   * component works standalone (e.g. local-only attachment lists) without
   * any backend wired up.
   */
  uploadFile?: (file: File, onProgress: (percent: number) => void, signal: AbortSignal) => Promise<void>;
  /** Comma-separated extensions/MIME types, e.g. `".png,.jpg,application/pdf"`. */
  accept?: string;
  multiple?: boolean;
  maxFiles?: number;
  maxSizeBytes?: number;
  /** @default true — renders image thumbnails for image files. */
  showPreviews?: boolean;
}
