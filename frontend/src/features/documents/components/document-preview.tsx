"use client";

import { cn } from "@/lib/utils";

export interface DocumentPreviewProps {
  html: string;
  className?: string;
}

function DocumentPreview({ html, className }: DocumentPreviewProps) {
  if (!html.trim()) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">This document has no content yet.</p>
    );
  }

  return (
    <div
      className={cn(
        "prose prose-sm max-w-none text-foreground dark:prose-invert",
        "prose-headings:scroll-mt-20 prose-a:text-primary",
        className
      )}
      data-slot="document-preview"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

export { DocumentPreview };
