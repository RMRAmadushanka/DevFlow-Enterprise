"use client";

import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

import { cn } from "@/lib/utils";
import { routes } from "@/config/routes";

export interface DocumentBreadcrumbItem {
  id: string;
  title: string;
}

export interface DocumentBreadcrumbProps {
  items?: DocumentBreadcrumbItem[];
  className?: string;
}

function DocumentBreadcrumb({ items = [], className }: DocumentBreadcrumbProps) {
  return (
    <nav aria-label="Document breadcrumb" className={cn("flex flex-wrap items-center gap-1 text-sm", className)}>
      <Link
        href={routes.app.documents}
        className="inline-flex items-center gap-1 text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50"
      >
        <Home className="size-3.5" aria-hidden />
        <span>Documents</span>
      </Link>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <span key={item.id} className="inline-flex items-center gap-1">
            <ChevronRight className="size-3.5 text-muted-foreground" aria-hidden />
            {isLast ? (
              <span className="font-medium text-foreground" aria-current="page">
                {item.title}
              </span>
            ) : (
              <Link
                href={routes.app.document(item.id)}
                className="text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50"
              >
                {item.title}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}

export { DocumentBreadcrumb };
