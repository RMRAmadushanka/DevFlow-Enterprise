"use client";

import { cn } from "@/lib/utils";

export interface StackTraceViewerProps {
  stackTrace: string;
  className?: string;
}

function StackTraceViewer({ stackTrace, className }: StackTraceViewerProps) {
  return (
    <pre
      className={cn(
        "max-h-80 overflow-auto rounded-lg border border-border bg-muted/40 p-3 font-mono text-xs leading-relaxed text-foreground",
        className
      )}
      data-slot="stack-trace-viewer"
      tabIndex={0}
    >
      {stackTrace || "No stack trace available."}
    </pre>
  );
}

export { StackTraceViewer };
