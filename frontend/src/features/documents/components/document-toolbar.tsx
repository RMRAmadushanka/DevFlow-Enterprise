"use client";

import { Check, CloudOff, Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

import { useDocumentStore } from "../store/document.store";

export interface DocumentToolbarProps {
  wordCount?: number;
  readingTimeMinutes?: number;
  className?: string;
}

function AutoSaveIndicator() {
  const status = useDocumentStore((s) => s.autoSaveStatus);

  if (status === "idle") return null;

  const config = {
    saving: {
      icon: <Loader2 className="size-3.5 animate-spin" aria-hidden />,
      label: "Saving…",
      className: "text-muted-foreground",
    },
    saved: {
      icon: <Check className="size-3.5" aria-hidden />,
      label: "Saved",
      className: "text-emerald-600 dark:text-emerald-400",
    },
    error: {
      icon: <CloudOff className="size-3.5" aria-hidden />,
      label: "Save failed",
      className: "text-destructive",
    },
  }[status];

  return (
    <span
      className={cn("inline-flex items-center gap-1.5 text-xs", config.className)}
      role="status"
      aria-live="polite"
    >
      {config.icon}
      {config.label}
    </span>
  );
}

function DocumentToolbar({
  wordCount = 0,
  readingTimeMinutes = 1,
  className,
}: DocumentToolbarProps) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-3 border-b border-border px-1 py-2 text-sm text-muted-foreground",
        className
      )}
      data-slot="document-toolbar"
    >
      <div className="flex flex-wrap items-center gap-3">
        <span>
          <span className="font-medium text-foreground">{wordCount.toLocaleString()}</span> words
        </span>
        <span aria-hidden>·</span>
        <span>
          <span className="font-medium text-foreground">{readingTimeMinutes}</span> min read
        </span>
      </div>
      <AutoSaveIndicator />
    </div>
  );
}

export { DocumentToolbar, AutoSaveIndicator };
