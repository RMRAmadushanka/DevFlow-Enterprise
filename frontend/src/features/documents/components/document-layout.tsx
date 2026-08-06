"use client";

import { cn } from "@/lib/utils";

import { useDocumentStore } from "../store/document.store";
import { DocumentSidebar } from "./document-sidebar";

export interface DocumentLayoutProps {
  children: React.ReactNode;
  className?: string;
  hideSidebar?: boolean;
}

function DocumentLayout({ children, className, hideSidebar }: DocumentLayoutProps) {
  const collapsed = useDocumentStore((s) => s.sidebarCollapsed);

  return (
    <div
      className={cn(
        "flex min-h-[calc(100vh-8rem)] flex-col overflow-hidden rounded-xl border border-border md:flex-row",
        className
      )}
      data-slot="document-layout"
    >
      {!hideSidebar ? (
        <div
          className={cn(
            "shrink-0 border-b border-border md:border-b-0",
            collapsed ? "md:w-14" : "md:w-64"
          )}
        >
          <DocumentSidebar className="h-full w-full border-r-0 md:border-r" />
        </div>
      ) : null}
      <div className="min-w-0 flex-1 overflow-auto p-4 md:p-6">{children}</div>
    </div>
  );
}

export { DocumentLayout };
