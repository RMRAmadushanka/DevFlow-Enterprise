"use client";

import * as React from "react";
import {
  File,
  FileArchive,
  FileAudio,
  FileImage,
  FileSpreadsheet,
  FileText,
  FileVideo,
} from "lucide-react";
import { motion } from "framer-motion";

import { cn } from "@/lib/utils";
import { formatBytes } from "@/components/data-display/shared/formatters";
import { duration, easing } from "@/design-system/tokens/motion";
import { resolveFileKind } from "./utils";
import type { FileCardProps, FileKind } from "./types";

const kindIcon: Record<FileKind, React.ComponentType<{ className?: string }>> = {
  image: FileImage,
  pdf: FileText,
  document: FileText,
  spreadsheet: FileSpreadsheet,
  archive: FileArchive,
  video: FileVideo,
  audio: FileAudio,
  other: File,
};

/**
 * Compact file row — type icon, name, size, and an actions slot.
 * Interactive when `onClick` is provided; never nests action buttons
 * inside the clickable surface when actions are present (sibling layout).
 */
function FileCard({ file, actions, onClick, selected, disabled, className }: FileCardProps) {
  const kind = resolveFileKind(file);
  const Icon = kindIcon[kind];
  const interactive = !!onClick && !disabled;

  return (
    <motion.div
      data-slot="file-card"
      data-selected={selected || undefined}
      whileHover={interactive ? { y: -1 } : undefined}
      transition={{ duration: duration.fast, ease: easing.standard }}
      className={cn(
        "flex items-center gap-3 rounded-lg border border-border bg-card px-3 py-2.5 transition-colors",
        selected && "border-primary ring-2 ring-primary/30",
        disabled && "pointer-events-none opacity-50",
        className
      )}
    >
      <button
        type="button"
        disabled={!interactive}
        onClick={onClick}
        className={cn(
          "flex min-w-0 flex-1 items-center gap-3 text-left outline-none",
          interactive && "focus-visible:ring-2 focus-visible:ring-ring/50 rounded-md"
        )}
      >
        <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
          <Icon className="size-4" aria-hidden="true" />
        </span>
        <span className="flex min-w-0 flex-col">
          <span className="truncate text-sm font-medium text-foreground">{file.name}</span>
          {file.sizeBytes != null ? (
            <span className="text-xs text-muted-foreground">{formatBytes(file.sizeBytes)}</span>
          ) : null}
        </span>
      </button>
      {actions ? <div className="flex shrink-0 items-center gap-1">{actions}</div> : null}
    </motion.div>
  );
}

export { FileCard };
