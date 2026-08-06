"use client";

import * as React from "react";

import type { FileTreeNode } from "../types/repository.types";
import { useRepositoryFiles } from "../hooks/use-repositories";
import { BranchSelector } from "./branch-selector";
import { FileExplorer } from "./file-explorer";
import { FileViewer } from "./file-viewer";
import { CodeBrowserSkeleton } from "./repository-skeleton";
import { RepositoryEmptyState } from "./repository-empty-state";

export interface CodeBrowserProps {
  repositoryId: string;
}

function CodeBrowser({ repositoryId }: CodeBrowserProps) {
  const { data: nodes = [], isLoading, isError } = useRepositoryFiles(repositoryId);
  const [selectedPath, setSelectedPath] = React.useState<string | null>(null);

  const handleSelect = (node: FileTreeNode) => {
    if (node.type === "file") {
      setSelectedPath(node.path);
    }
  };

  if (isLoading) return <CodeBrowserSkeleton />;

  if (isError || nodes.length === 0) {
    return <RepositoryEmptyState variant="no-files" />;
  }

  return (
    <div className="flex flex-col gap-4" data-slot="code-browser">
      <BranchSelector repositoryId={repositoryId} />
      <div className="grid gap-4 lg:grid-cols-[260px_1fr]">
        <div className="max-h-[560px] overflow-auto rounded-xl border border-border">
          <FileExplorer
            nodes={nodes}
            selectedPath={selectedPath}
            onSelect={handleSelect}
          />
        </div>
        <FileViewer repositoryId={repositoryId} path={selectedPath} />
      </div>
    </div>
  );
}

export { CodeBrowser };
