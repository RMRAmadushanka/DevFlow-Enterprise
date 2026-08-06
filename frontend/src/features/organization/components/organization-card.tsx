"use client";

import Link from "next/link";
import { Building2, MoreHorizontal, Settings, LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PermissionGuard } from "@/lib/permissions";
import { routes } from "@/config/routes";
import { cn } from "@/lib/utils";

import type { Organization } from "../types/organization.types";
import { RoleBadge } from "./role-badge";

function formatCreatedDate(value: string) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(new Date(value));
}

export interface OrganizationCardProps {
  organization: Organization;
  onLeave?: (organization: Organization) => void;
  className?: string;
}

function OrganizationCard({ organization, onLeave, className }: OrganizationCardProps) {
  return (
    <article
      className={cn(
        "flex flex-col gap-4 rounded-xl border border-border bg-card p-5 transition-colors hover:border-ring/40",
        className
      )}
      data-slot="organization-card"
    >
      <div className="flex items-start gap-3">
        <div className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-muted">
          {organization.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={organization.logoUrl} alt="" className="size-full object-cover" />
          ) : (
            <Building2 className="size-5 text-muted-foreground" aria-hidden="true" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="truncate text-base font-semibold text-foreground">{organization.name}</h3>
              <p className="truncate text-xs text-muted-foreground">/{organization.slug}</p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    type="button"
                    size="icon-sm"
                    variant="ghost"
                    aria-label={`Actions for ${organization.name}`}
                  />
                }
              >
                <MoreHorizontal className="size-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem render={<Link href={routes.app.organization(organization.id)} />}>
                  Open
                </DropdownMenuItem>
                <PermissionGuard permission={["organization.update", "org.manage"]}>
                  <DropdownMenuItem render={<Link href={routes.app.settings.organization} />}>
                    <Settings className="size-4" />
                    Settings
                  </DropdownMenuItem>
                </PermissionGuard>
                {organization.myRole !== "owner" ? (
                  <DropdownMenuItem
                    onClick={() => onLeave?.(organization)}
                    className="text-destructive"
                  >
                    <LogOut className="size-4" />
                    Leave organization
                  </DropdownMenuItem>
                ) : null}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
            {organization.description || "No description"}
          </p>
        </div>
      </div>

      <div className="mt-auto flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <RoleBadge role={organization.myRole} size="sm" />
        <span>{organization.memberCount} members</span>
        <span aria-hidden="true">·</span>
        <span>Created {formatCreatedDate(organization.createdAt)}</span>
      </div>

      <Button render={<Link href={routes.app.organization(organization.id)} />} variant="outline" size="sm">
        Open organization
      </Button>
    </article>
  );
}

export { OrganizationCard };
