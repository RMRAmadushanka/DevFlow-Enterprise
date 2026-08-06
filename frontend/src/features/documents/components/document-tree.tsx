"use client";

import Link from "next/link";
import { ChevronDown, ChevronRight, FileText, Folder, GripVertical } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { routes } from "@/config/routes";

import { useDocumentTree } from "../hooks/use-documents";
import { useDocumentStore } from "../store/document.store";
import type { DocumentTreeNode } from "../types/document.types";
import { SidebarSkeleton } from "./document-skeleton";

export interface DocumentTreeProps {
  className?: string;
  onSelect?: (node: DocumentTreeNode) => void;
}

function TreeNodeRow({
  node,
  depth,
  onSelect,
}: {
  node: DocumentTreeNode;
  depth: number;
  onSelect?: (node: DocumentTreeNode) => void;
}) {
  const expandedTreeIds = useDocumentStore((s) => s.expandedTreeIds);
  const toggleTreeNode = useDocumentStore((s) => s.toggleTreeNode);
  const setFilters = useDocumentStore((s) => s.setFilters);
  const expanded = expandedTreeIds.includes(node.id);
  const hasChildren = node.children.length > 0;

  return (
    <li>
      <div
        className={cn(
          "group flex items-center gap-0.5 rounded-md hover:bg-muted/60",
          depth === 0 && "pl-0",
          depth === 1 && "pl-3",
          depth === 2 && "pl-6",
          depth === 3 && "pl-9",
          depth >= 4 && "pl-12"
        )}
      >
        <span
          className="flex size-6 cursor-grab items-center justify-center text-muted-foreground/50 opacity-0 transition-opacity group-hover:opacity-100"
          aria-hidden
          title="Drag to reorder"
        >
          <GripVertical className="size-3.5" />
        </span>
        {hasChildren || node.isFolder ? (
          <Button
            type="button"
            size="icon-sm"
            variant="ghost"
            className="size-6"
            aria-label={expanded ? `Collapse ${node.title}` : `Expand ${node.title}`}
            aria-expanded={expanded}
            onClick={() => toggleTreeNode(node.id)}
          >
            {expanded ? (
              <ChevronDown className="size-3.5" />
            ) : (
              <ChevronRight className="size-3.5" />
            )}
          </Button>
        ) : (
          <span className="size-6" aria-hidden />
        )}
        {node.isFolder ? (
          <button
            type="button"
            className="flex min-w-0 flex-1 items-center gap-1.5 truncate rounded-md px-1 py-1.5 text-left text-sm outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50"
            onClick={() => {
              setFilters({ folderId: node.id });
              onSelect?.(node);
            }}
          >
            <Folder className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
            <span className="truncate">{node.title}</span>
            {typeof node.documentCount === "number" ? (
              <span className="ml-auto shrink-0 text-xs text-muted-foreground">
                {node.documentCount}
              </span>
            ) : null}
          </button>
        ) : (
          <Link
            href={routes.app.document(node.id)}
            className="flex min-w-0 flex-1 items-center gap-1.5 truncate rounded-md px-1 py-1.5 text-sm outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50"
            onClick={() => onSelect?.(node)}
          >
            <span aria-hidden>{node.icon || <FileText className="size-3.5 text-muted-foreground" />}</span>
            <span className="truncate">{node.title}</span>
          </Link>
        )}
      </div>
      {expanded && hasChildren ? (
        <ul className="mt-0.5 space-y-0.5" role="group">
          {node.children.map((child) => (
            <TreeNodeRow key={child.id} node={child} depth={depth + 1} onSelect={onSelect} />
          ))}
        </ul>
      ) : null}
    </li>
  );
}

function DocumentTree({ className, onSelect }: DocumentTreeProps) {
  const { data: tree = [], isLoading } = useDocumentTree();

  if (isLoading) return <SidebarSkeleton />;

  if (tree.length === 0) {
    return <p className="px-2 py-3 text-sm text-muted-foreground">No folders yet.</p>;
  }

  return (
    <ul
      className={cn("space-y-0.5", className)}
      role="tree"
      aria-label="Document tree"
      data-slot="document-tree"
    >
      {tree.map((node) => (
        <TreeNodeRow key={node.id} node={node} depth={0} onSelect={onSelect} />
      ))}
    </ul>
  );
}

export { DocumentTree };
