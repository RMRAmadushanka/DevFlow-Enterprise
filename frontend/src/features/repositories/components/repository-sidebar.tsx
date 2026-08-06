"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  Code2,
  GitBranch,
  GitCommitHorizontal,
  GitPullRequest,
  LayoutDashboard,
  Settings,
  Tag,
  Users,
  Webhook,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { routes } from "@/config/routes";

import { REPOSITORY_DETAIL_TABS } from "../constants/repository.constants";

const TAB_ICONS: Record<
  string,
  React.ComponentType<{ className?: string }>
> = {
  overview: LayoutDashboard,
  files: Code2,
  branches: GitBranch,
  commits: GitCommitHorizontal,
  "pull-requests": GitPullRequest,
  releases: Tag,
  members: Users,
  webhooks: Webhook,
  settings: Settings,
};

export interface RepositorySidebarProps {
  repositoryId: string;
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
  className?: string;
}

function RepositorySidebar({
  repositoryId,
  collapsed = false,
  onCollapsedChange,
  className,
}: RepositorySidebarProps) {
  const pathname = usePathname();

  const tabs = REPOSITORY_DETAIL_TABS.map((tab) => ({
    ...tab,
    href:
      tab.value === "overview"
        ? routes.app.repository(repositoryId)
        : tab.value === "files"
          ? routes.app.repositoryFiles(repositoryId)
          : tab.value === "branches"
            ? routes.app.repositoryBranches(repositoryId)
            : tab.value === "commits"
              ? routes.app.repositoryCommits(repositoryId)
              : tab.value === "pull-requests"
                ? routes.app.repositoryPullRequests(repositoryId)
                : tab.value === "releases"
                  ? routes.app.repositoryReleases(repositoryId)
                  : tab.value === "webhooks"
                    ? routes.app.repositoryWebhooks(repositoryId)
                    : tab.value === "settings"
                      ? routes.app.repositorySettings(repositoryId)
                      : `${routes.app.repository(repositoryId)}/${tab.value}`,
  }));

  return (
    <aside
      className={cn(
        "flex h-full flex-col border-r border-border bg-muted/20 transition-[width] duration-200",
        collapsed ? "w-14" : "w-56",
        className
      )}
      data-slot="repository-sidebar"
      aria-label="Repository navigation"
    >
      <div className="flex items-center justify-between gap-2 border-b border-border p-2">
        {!collapsed ? (
          <span className="truncate px-1 text-sm font-semibold text-foreground">
            Repository
          </span>
        ) : null}
        {onCollapsedChange ? (
          <Button
            type="button"
            size="icon-sm"
            variant="ghost"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            onClick={() => onCollapsedChange(!collapsed)}
          >
            {collapsed ? (
              <ChevronRight className="size-4" />
            ) : (
              <ChevronLeft className="size-4" />
            )}
          </Button>
        ) : null}
      </div>

      <nav className="flex flex-col gap-0.5 p-2" aria-label="Repository sections">
        {tabs.map((tab) => {
          const Icon = TAB_ICONS[tab.value] ?? LayoutDashboard;
          const active =
            tab.value === "overview"
              ? pathname === routes.app.repository(repositoryId)
              : pathname.startsWith(tab.href);
          return (
            <Button
              key={tab.value}
              render={<Link href={tab.href} />}
              variant={active ? "secondary" : "ghost"}
              size="sm"
              className={cn("justify-start", collapsed && "justify-center px-0")}
              aria-current={active ? "page" : undefined}
              aria-label={tab.label}
            >
              <Icon className="size-4 shrink-0" />
              {!collapsed ? <span>{tab.label}</span> : null}
            </Button>
          );
        })}
      </nav>
    </aside>
  );
}

export { RepositorySidebar };
