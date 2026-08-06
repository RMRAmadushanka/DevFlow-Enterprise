"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Building2, ChevronsUpDown, Plus, Search, Settings } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { routes } from "@/config/routes";
import { cn } from "@/lib/utils";

import { useOrganizations } from "../hooks/use-organizations";
import { useOrganizationStore } from "../store/organization.store";

export interface OrganizationSwitcherProps {
  collapsed?: boolean;
  className?: string;
}

function OrganizationSwitcher({ collapsed, className }: OrganizationSwitcherProps) {
  const router = useRouter();
  const { data: organizations = [], isLoading } = useOrganizations();
  const currentOrganizationId = useOrganizationStore((s) => s.currentOrganizationId);
  const switchOrganization = useOrganizationStore((s) => s.switchOrganization);
  const switcherOpen = useOrganizationStore((s) => s.switcherOpen);
  const setSwitcherOpen = useOrganizationStore((s) => s.setSwitcherOpen);
  const [query, setQuery] = React.useState("");

  const active =
    organizations.find((org) => org.id === currentOrganizationId) ?? organizations[0];

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return organizations;
    return organizations.filter(
      (org) =>
        org.name.toLowerCase().includes(q) || org.slug.toLowerCase().includes(q)
    );
  }, [organizations, query]);

  if (!active && !isLoading) return null;

  const label = active?.name ?? "Organizations";

  const trigger = (
    <Button
      variant="outline"
      className={cn(
        "h-auto w-full justify-start gap-2 border-sidebar-border bg-transparent px-2 py-1.5 hover:bg-sidebar-accent",
        collapsed && "justify-center px-0",
        className
      )}
      aria-label={`Switch organization, current: ${label}`}
      disabled={isLoading && !active}
    >
      <span className="flex size-7 shrink-0 items-center justify-center overflow-hidden rounded-md border border-sidebar-border bg-muted">
        {active?.logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={active.logoUrl} alt="" className="size-full object-cover" />
        ) : (
          <Building2 className="size-3.5 text-muted-foreground" aria-hidden />
        )}
      </span>
      {!collapsed && (
        <>
          <span className="min-w-0 flex-1 truncate text-left text-sm font-medium text-sidebar-foreground">
            {label}
          </span>
          <ChevronsUpDown className="size-3.5 shrink-0 text-muted-foreground" />
        </>
      )}
    </Button>
  );

  return (
    <div className="p-2" data-slot="organization-switcher">
      <DropdownMenu open={switcherOpen} onOpenChange={setSwitcherOpen}>
        <DropdownMenuTrigger render={trigger} />
        <DropdownMenuContent align="start" className="w-72">
          <DropdownMenuGroup>
            <DropdownMenuLabel className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
              Organizations
            </DropdownMenuLabel>
            <div className="px-2 pb-2">
              <div className="relative">
                <Search className="pointer-events-none absolute top-1/2 left-2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search organizations"
                  className="h-8 pl-7"
                  aria-label="Search organizations"
                />
              </div>
            </div>
            {filtered.length === 0 ? (
              <div className="px-2 py-3 text-sm text-muted-foreground">No organizations found</div>
            ) : (
              filtered.map((org) => (
                <DropdownMenuItem
                  key={org.id}
                  onClick={() => {
                    switchOrganization(org.id);
                    router.push(routes.app.organization(org.id));
                  }}
                  className={cn(org.id === active?.id && "bg-accent")}
                >
                  <span className="flex size-6 items-center justify-center overflow-hidden rounded border border-border bg-muted">
                    {org.logoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={org.logoUrl} alt="" className="size-full object-cover" />
                    ) : (
                      <Building2 className="size-3 text-muted-foreground" aria-hidden />
                    )}
                  </span>
                  <span className="min-w-0 flex-1 truncate">{org.name}</span>
                </DropdownMenuItem>
              ))
            )}
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => {
              setSwitcherOpen(false);
              router.push(routes.app.organizationNew);
            }}
          >
            <Plus className="size-4" />
            Create organization
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              setSwitcherOpen(false);
              router.push(routes.app.settings.organization);
            }}
          >
            <Settings className="size-4" />
            Organization settings
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export { OrganizationSwitcher };
