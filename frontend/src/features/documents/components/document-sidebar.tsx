"use client";

import * as React from "react";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  FileStack,
  FolderOpen,
  LayoutTemplate,
  Share2,
  Star,
  Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { routes } from "@/config/routes";

import { useDocumentStore } from "../store/document.store";
import type { DocumentSidebarSection } from "../types/document.types";
import { DocumentTree } from "./document-tree";

const SECTIONS: Array<{
  id: DocumentSidebarSection;
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  { id: "workspace", label: "Workspace", href: routes.app.documents, icon: FolderOpen },
  { id: "favorites", label: "Favorites", href: routes.app.documentFavorites, icon: Star },
  { id: "recent", label: "Recent", href: routes.app.documentRecent, icon: Clock },
  { id: "shared", label: "Shared", href: routes.app.documentShared, icon: Share2 },
  { id: "templates", label: "Templates", href: routes.app.documentTemplates, icon: LayoutTemplate },
  { id: "folders", label: "Folders", href: routes.app.documents, icon: FileStack },
  { id: "trash", label: "Trash", href: routes.app.documents, icon: Trash2 },
];

export interface DocumentSidebarProps {
  className?: string;
}

function DocumentSidebar({ className }: DocumentSidebarProps) {
  const collapsed = useDocumentStore((s) => s.sidebarCollapsed);
  const setSidebarCollapsed = useDocumentStore((s) => s.setSidebarCollapsed);
  const sidebarSection = useDocumentStore((s) => s.sidebarSection);
  const setSidebarSection = useDocumentStore((s) => s.setSidebarSection);
  const setFilters = useDocumentStore((s) => s.setFilters);

  return (
    <aside
      className={cn(
        "flex h-full flex-col border-r border-border bg-muted/20 transition-[width] duration-200",
        collapsed ? "w-14" : "w-64",
        className
      )}
      data-slot="document-sidebar"
      aria-label="Document navigation"
    >
      <div className="flex items-center justify-between gap-2 border-b border-border p-2">
        {!collapsed ? (
          <span className="truncate px-1 text-sm font-semibold text-foreground">Knowledge</span>
        ) : null}
        <Button
          type="button"
          size="icon-sm"
          variant="ghost"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          onClick={() => setSidebarCollapsed(!collapsed)}
        >
          {collapsed ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
        </Button>
      </div>

      <nav className="flex flex-col gap-0.5 p-2" aria-label="Document sections">
        {SECTIONS.map((section) => {
          const Icon = section.icon;
          const active = sidebarSection === section.id;
          return (
            <Button
              key={section.id}
              render={<Link href={section.href} />}
              variant={active ? "secondary" : "ghost"}
              size="sm"
              className={cn("justify-start", collapsed && "justify-center px-0")}
              aria-current={active ? "page" : undefined}
              aria-label={section.label}
              onClick={() => {
                setSidebarSection(section.id);
                if (section.id === "trash") {
                  setFilters({ trashOnly: true, favoritesOnly: false, sharedOnly: false });
                } else if (section.id === "favorites") {
                  setFilters({ favoritesOnly: true, trashOnly: false, sharedOnly: false });
                } else if (section.id === "shared") {
                  setFilters({ sharedOnly: true, trashOnly: false, favoritesOnly: false });
                } else if (section.id === "workspace" || section.id === "folders") {
                  setFilters({ trashOnly: false, favoritesOnly: false, sharedOnly: false });
                }
              }}
            >
              <Icon className="size-4 shrink-0" />
              {!collapsed ? <span className="truncate">{section.label}</span> : null}
            </Button>
          );
        })}
      </nav>

      {!collapsed && (sidebarSection === "workspace" || sidebarSection === "folders") ? (
        <div className="min-h-0 flex-1 overflow-y-auto border-t border-border p-2">
          <p className="mb-1 px-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Folders
          </p>
          <DocumentTree />
        </div>
      ) : null}
    </aside>
  );
}

export { DocumentSidebar };
