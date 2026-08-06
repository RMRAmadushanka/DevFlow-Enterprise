"use client";

import * as React from "react";
import { ChevronDown, ChevronRight, File, Folder } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { useRepositoryStore } from "../store/repository.store";
import type { FileTreeNode } from "../types/repository.types";

export interface FileTreeProps {
  nodes: FileTreeNode[];
  selectedPath?: string | null;
  onSelect?: (node: FileTreeNode) => void;
  className?: string;
}

function TreeNode({
  node,
  depth,
  selectedPath,
  onSelect,
}: {
  node: FileTreeNode;
  depth: number;
  selectedPath?: string | null;
  onSelect?: (node: FileTreeNode) => void;
}) {
  const expanded = useRepositoryStore((s) => s.expandedFilePaths.includes(node.path));
  const toggleFilePath = useRepositoryStore((s) => s.toggleFilePath);
  const isSelected = selectedPath === node.path;
  const isFolder = node.type === "folder";

  return (
    <li>
      <Button
        type="button"
        variant={isSelected ? "secondary" : "ghost"}
        size="sm"
        className={cn("h-8 w-full justify-start gap-1.5 px-2 font-normal")}
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
        onClick={() => {
          if (isFolder) toggleFilePath(node.path);
          onSelect?.(node);
        }}
      >
        {isFolder ? (
          expanded ? (
            <ChevronDown className="size-3.5 shrink-0" aria-hidden />
          ) : (
            <ChevronRight className="size-3.5 shrink-0" aria-hidden />
          )
        ) : (
          <span className="size-3.5 shrink-0" aria-hidden />
        )}
        {isFolder ? (
          <Folder className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
        ) : (
          <File className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
        )}
        <span className="truncate">{node.name}</span>
      </Button>
      {isFolder && expanded && node.children?.length ? (
        <ul className="flex flex-col">
          {node.children.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              depth={depth + 1}
              selectedPath={selectedPath}
              onSelect={onSelect}
            />
          ))}
        </ul>
      ) : null}
    </li>
  );
}

function FileTree({ nodes, selectedPath, onSelect, className }: FileTreeProps) {
  return (
    <ul
      className={cn("flex flex-col overflow-auto py-1", className)}
      data-slot="file-tree"
      role="tree"
    >
      {nodes.map((node) => (
        <TreeNode
          key={node.id}
          node={node}
          depth={0}
          selectedPath={selectedPath}
          onSelect={onSelect}
        />
      ))}
    </ul>
  );
}

export { FileTree };
