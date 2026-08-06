import type * as React from "react";

export type FileKind = "image" | "pdf" | "document" | "spreadsheet" | "archive" | "video" | "audio" | "other";

export interface FileMeta {
  name: string;
  sizeBytes?: number;
  mimeType?: string;
  /** Remote or object URL used by `FilePreview`. */
  url?: string;
  kind?: FileKind;
}

export interface FileCardProps {
  file: FileMeta;
  actions?: React.ReactNode;
  onClick?: () => void;
  selected?: boolean;
  disabled?: boolean;
  className?: string;
}

export interface FilePreviewProps {
  file: FileMeta;
  /** Max preview height. @default 240 */
  maxHeight?: number;
  className?: string;
  /** Called when the user requests a full download/open. */
  onOpen?: () => void;
}
