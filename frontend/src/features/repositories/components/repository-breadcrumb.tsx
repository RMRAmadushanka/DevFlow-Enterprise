"use client";

import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

import { cn } from "@/lib/utils";
import { routes } from "@/config/routes";

export interface RepositoryBreadcrumbItem {
  id?: string;
  label: string;
  href?: string;
}

export interface RepositoryBreadcrumbProps {
  items?: RepositoryBreadcrumbItem[];
  repositoryName?: string;
  repositoryId?: string;
  className?: string;
}

function RepositoryBreadcrumb({
  items,
  repositoryName,
  repositoryId,
  className,
}: RepositoryBreadcrumbProps) {
  const crumbs: RepositoryBreadcrumbItem[] =
    items ??
    [
      ...(repositoryId && repositoryName
        ? [{ id: repositoryId, label: repositoryName, href: routes.app.repository(repositoryId) }]
        : []),
    ];

  return (
    <nav
      aria-label="Repository breadcrumb"
      className={cn("flex flex-wrap items-center gap-1 text-sm", className)}
    >
      <Link
        href={routes.app.repositories}
        className="inline-flex items-center gap-1 text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50"
      >
        <Home className="size-3.5" aria-hidden />
        <span>Repositories</span>
      </Link>
      {crumbs.map((item, index) => {
        const isLast = index === crumbs.length - 1;
        return (
          <span key={item.id ?? item.label} className="inline-flex items-center gap-1">
            <ChevronRight className="size-3.5 text-muted-foreground" aria-hidden />
            {isLast || !item.href ? (
              <span className="font-medium text-foreground" aria-current="page">
                {item.label}
              </span>
            ) : (
              <Link
                href={item.href}
                className="text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50"
              >
                {item.label}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}

export { RepositoryBreadcrumb };
