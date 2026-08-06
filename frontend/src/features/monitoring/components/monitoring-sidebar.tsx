"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Bug,
  ChevronLeft,
  ChevronRight,
  FileBarChart,
  LayoutDashboard,
  ScrollText,
  Server,
  ShieldAlert,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { routes } from "@/config/routes";

const NAV_ITEMS = [
  {
    label: "Overview",
    href: routes.app.monitoring,
    icon: LayoutDashboard,
    match: (path: string) => path === routes.app.monitoring,
  },
  {
    label: "Services",
    href: routes.app.monitoringServices,
    icon: Server,
    match: (path: string) => path.startsWith(routes.app.monitoringServices),
  },
  {
    label: "Alerts",
    href: routes.app.monitoringAlerts,
    icon: AlertTriangle,
    match: (path: string) => path.startsWith(routes.app.monitoringAlerts),
  },
  {
    label: "Incidents",
    href: routes.app.monitoringIncidents,
    icon: ShieldAlert,
    match: (path: string) => path.startsWith(routes.app.monitoringIncidents),
  },
  {
    label: "Errors",
    href: routes.app.monitoringErrors,
    icon: Bug,
    match: (path: string) => path.startsWith(routes.app.monitoringErrors),
  },
  {
    label: "Audit",
    href: routes.app.monitoringAudit,
    icon: ScrollText,
    match: (path: string) => path.startsWith(routes.app.monitoringAudit),
  },
  {
    label: "Analytics",
    href: routes.app.analytics,
    icon: BarChart3,
    match: (path: string) =>
      path === routes.app.analytics ||
      (path.startsWith(routes.app.analytics) &&
        !path.startsWith(routes.app.analyticsReports) &&
        !path.startsWith(routes.app.analyticsExecutive)),
  },
  {
    label: "Reports",
    href: routes.app.analyticsReports,
    icon: FileBarChart,
    match: (path: string) => path.startsWith(routes.app.analyticsReports),
  },
  {
    label: "Executive",
    href: routes.app.analyticsExecutive,
    icon: Activity,
    match: (path: string) => path.startsWith(routes.app.analyticsExecutive),
  },
] as const;

export interface MonitoringSidebarProps {
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
  className?: string;
}

function MonitoringSidebar({
  collapsed = false,
  onCollapsedChange,
  className,
}: MonitoringSidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "flex h-full flex-col border-r border-border bg-muted/20 transition-[width] duration-200",
        collapsed ? "w-14" : "w-56",
        className
      )}
      data-slot="monitoring-sidebar"
      aria-label="Monitoring navigation"
    >
      <div className="flex items-center justify-between gap-2 border-b border-border p-2">
        {!collapsed ? (
          <span className="truncate px-1 text-sm font-semibold text-foreground">
            Observability
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
      <nav className="flex flex-1 flex-col gap-0.5 p-2">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = item.match(pathname);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors",
                active
                  ? "bg-primary-muted font-medium text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
                collapsed && "justify-center px-0"
              )}
              aria-current={active ? "page" : undefined}
              title={collapsed ? item.label : undefined}
            >
              <Icon className="size-4 shrink-0" />
              {!collapsed ? <span className="truncate">{item.label}</span> : null}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

export { MonitoringSidebar };
