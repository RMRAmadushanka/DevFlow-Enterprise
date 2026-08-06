"use client";

import { Building2 } from "lucide-react";

import type { Organization } from "../types/organization.types";
import { RoleBadge } from "./role-badge";

export interface OrganizationHeaderProps {
  organization: Organization;
  actions?: React.ReactNode;
}

function OrganizationHeader({ organization, actions }: OrganizationHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between" data-slot="organization-header">
      <div className="flex min-w-0 items-start gap-3">
        <div className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border bg-muted">
          {organization.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={organization.logoUrl} alt="" className="size-full object-cover" />
          ) : (
            <Building2 className="size-6 text-muted-foreground" aria-hidden="true" />
          )}
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="truncate text-2xl font-semibold tracking-tight text-foreground">
              {organization.name}
            </h1>
            <RoleBadge role={organization.myRole} />
          </div>
          <p className="mt-1 text-sm text-muted-foreground">/{organization.slug}</p>
          {organization.description ? (
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{organization.description}</p>
          ) : null}
        </div>
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}

export { OrganizationHeader };
