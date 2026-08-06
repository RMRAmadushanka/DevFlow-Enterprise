"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { File, FileText, Film, Image as ImageIcon, Music, RotateCw, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { duration, easing } from "@/design-system/tokens/motion";
import { formatBytes } from "./utils";
import type { UploadFile } from "./types";

function fileIcon(file: File) {
  if (file.type.startsWith("image/")) return ImageIcon;
  if (file.type.startsWith("video/")) return Film;
  if (file.type.startsWith("audio/")) return Music;
  if (file.type === "application/pdf" || file.type.startsWith("text/")) return FileText;
  return File;
}

interface FileUploadItemProps {
  uploadFile: UploadFile;
  onRemove: () => void;
  onCancel: () => void;
  onRetry: () => void;
  showPreview: boolean;
}

function FileUploadItem({ uploadFile, onRemove, onCancel, onRetry, showPreview }: FileUploadItemProps) {
  const { file, status, progress, error, previewUrl } = uploadFile;
  const Icon = fileIcon(file);

  return (
    <motion.li
      layout
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0, transition: { duration: duration.instant, ease: easing.accelerate } }}
      transition={{ duration: duration.fast, ease: easing.decelerate }}
      className="overflow-hidden"
    >
      <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-2.5">
        <div className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted">
          {showPreview && previewUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- local object URL preview, not a Next-optimizable remote asset
            <img src={previewUrl} alt="" className="size-full object-cover" />
          ) : (
            <Icon className="size-4 text-muted-foreground" aria-hidden="true" />
          )}
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <div className="flex items-center justify-between gap-2">
            <span className="truncate text-sm font-medium text-foreground">{file.name}</span>
            <span className="shrink-0 text-xs text-muted-foreground">{formatBytes(file.size)}</span>
          </div>

          {status === "uploading" ? (
            <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
              <motion.div
                className="h-full rounded-full bg-primary"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: duration.fast, ease: easing.standard }}
              />
            </div>
          ) : status === "error" ? (
            <p className="text-xs text-danger">{error ?? "Upload failed"}</p>
          ) : status === "cancelled" ? (
            <p className="text-xs text-muted-foreground">Cancelled</p>
          ) : null}
        </div>

        <div className="flex shrink-0 items-center gap-0.5">
          {status === "uploading" ? (
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label={`Cancel upload of ${file.name}`}
              onClick={onCancel}
            >
              <X className="size-3.5" />
            </Button>
          ) : status === "error" ? (
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label={`Retry upload of ${file.name}`}
              onClick={onRetry}
            >
              <RotateCw className="size-3.5" />
            </Button>
          ) : null}
          {status !== "uploading" ? (
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label={`Remove ${file.name}`}
              onClick={onRemove}
            >
              <X className="size-3.5" />
            </Button>
          ) : null}
        </div>
      </div>
    </motion.li>
  );
}

export { FileUploadItem };
