"use client";

import { FileTree } from "./file-tree";
import type { FileTreeNode } from "../types/repository.types";
import { RepositoryEmptyState } from "./repository-empty-state";

export interface FileExplorerProps {
  nodes: FileTreeNode[];
  selectedPath?: string | null;
  onSelect?: (node: FileTreeNode) => void;
  className?: string;
}

function FileExplorer({
  nodes,
  selectedPath,
  onSelect,
  className,
}: FileExplorerProps) {
  if (nodes.length === 0) {
    return <RepositoryEmptyState variant="no-files" />;
  }

  return (
    <div
      className={className}
      data-slot="file-explorer"
      aria-label="File explorer"
    >
      <FileTree nodes={nodes} selectedPath={selectedPath} onSelect={onSelect} />
    </div>
  );
}

export { FileExplorer };
