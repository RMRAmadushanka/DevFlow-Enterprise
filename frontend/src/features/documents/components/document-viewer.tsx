"use client";

import * as React from "react";

import type { Document as DocumentEntity, DocumentDetail } from "../types/document.types";
import { countWords, estimateReadingTimeMinutes } from "../utils/content";
import { DocumentPreview } from "./document-preview";
import { DocumentToolbar } from "./document-toolbar";
import { EditorSkeleton } from "./document-skeleton";

export interface DocumentViewerProps {
  document?: DocumentEntity | DocumentDetail | null;
  html?: string;
  loading?: boolean;
  showToolbar?: boolean;
  className?: string;
}

function DocumentViewer({
  document: doc,
  html,
  loading,
  showToolbar = true,
  className,
}: DocumentViewerProps) {
  const content = html ?? doc?.contentHtml ?? "";

  const wordCount = React.useMemo(
    () => doc?.wordCount ?? countWords(content),
    [content, doc?.wordCount]
  );
  const readingTime = React.useMemo(
    () => doc?.readingTimeMinutes ?? estimateReadingTimeMinutes(content),
    [content, doc?.readingTimeMinutes]
  );

  if (loading) return <EditorSkeleton />;

  return (
    <div className={className} data-slot="document-viewer">
      {showToolbar ? (
        <DocumentToolbar wordCount={wordCount} readingTimeMinutes={readingTime} />
      ) : null}
      {doc?.coverImageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={doc.coverImageUrl}
          alt=""
          className="mb-6 max-h-56 w-full rounded-lg object-cover"
        />
      ) : null}
      <DocumentPreview html={content} className="mt-4" />
    </div>
  );
}

export { DocumentViewer };
