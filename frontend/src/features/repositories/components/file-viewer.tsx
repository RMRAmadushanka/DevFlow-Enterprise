"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { useFileContent } from "../hooks/use-repositories";
import { formatRepoSize } from "../utils/format";
import { CommitSkeleton } from "./repository-skeleton";

export interface FileViewerProps {
  repositoryId: string;
  path: string | null;
}

function FileViewer({ repositoryId, path }: FileViewerProps) {
  const { data: file, isLoading, isError } = useFileContent(
    repositoryId,
    path ?? undefined
  );

  if (!path) {
    return (
      <Card data-slot="file-viewer">
        <CardContent className="p-6">
          <p className="text-sm text-muted-foreground">
            Select a file to view its contents.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) return <CommitSkeleton />;

  if (isError || !file) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-sm text-muted-foreground">Could not load file.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card data-slot="file-viewer">
      <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2 space-y-0 border-b border-border pb-3">
        <CardTitle className="truncate font-mono text-sm">{file.path}</CardTitle>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span>{file.language || "Plain text"}</span>
          <span>{formatRepoSize(Math.ceil((file.sizeBytes || 0) / 1024) || 1)}</span>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {/* Syntax highlighting placeholder — integrate highlighter later */}
        <pre className="overflow-auto p-4 text-sm leading-relaxed">
          <code className="font-mono text-foreground whitespace-pre">
            {file.content}
          </code>
        </pre>
      </CardContent>
    </Card>
  );
}

export { FileViewer };
