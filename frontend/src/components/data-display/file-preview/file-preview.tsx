"use client";

import * as React from "react";
import { ExternalLink, FileText } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { formatBytes } from "@/components/data-display/shared/formatters";
import { resolveFileKind } from "./utils";
import type { FilePreviewProps } from "./types";

/**
 * Lightweight preview surface for images, PDFs (iframe when a URL is
 * available), and a document placeholder for everything else. Does not
 * fetch — the caller supplies `file.url`.
 */
function FilePreview({ file, maxHeight = 240, className, onOpen }: FilePreviewProps) {
  const kind = resolveFileKind(file);

  return (
    <div
      data-slot="file-preview"
      className={cn(
        "flex flex-col overflow-hidden rounded-lg border border-border bg-muted/30",
        className
      )}
    >
      <div className="flex items-center justify-between gap-2 border-b border-border bg-background px-3 py-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-foreground">{file.name}</p>
          {file.sizeBytes != null ? (
            <p className="text-xs text-muted-foreground">{formatBytes(file.sizeBytes)}</p>
          ) : null}
        </div>
        {onOpen ? (
          <Button type="button" variant="outline" size="sm" className="gap-1.5" onClick={onOpen}>
            <ExternalLink className="size-3.5" />
            Open
          </Button>
        ) : file.url ? (
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            render={<a href={file.url} target="_blank" rel="noreferrer" />}
          >
            <ExternalLink className="size-3.5" />
            Open
          </Button>
        ) : null}
      </div>

      <div className="flex items-center justify-center bg-muted/20 p-3" style={{ minHeight: maxHeight }}>
        {kind === "image" && file.url ? (
          // eslint-disable-next-line @next/next/no-img-element -- preview URLs are caller-supplied (object/remote)
          <img
            src={file.url}
            alt={file.name}
            className="max-w-full rounded-md object-contain"
            style={{ maxHeight }}
          />
        ) : kind === "pdf" && file.url ? (
          <iframe
            title={file.name}
            src={file.url}
            className="w-full rounded-md border border-border bg-background"
            style={{ height: maxHeight }}
          />
        ) : (
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <FileText className="size-10" aria-hidden="true" />
            <p className="text-sm">Preview not available for this file type</p>
          </div>
        )}
      </div>
    </div>
  );
}

export { FilePreview };
