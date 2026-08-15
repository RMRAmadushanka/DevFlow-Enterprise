"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { SettingsPageTemplate } from "@/components/layout/page-templates";
import { FeatureEmptyState } from "@/components/architecture/empty";
import { Button } from "@/components/ui/button";
import { routes } from "@/config/routes";

import { ORGANIZATION_SETTINGS_NAV } from "../constants/organization.constants";
import { useCurrentOrganization } from "../hooks/use-organizations";
import { OrganizationSettingsSkeleton } from "./skeletons";

export interface OrganizationSettingsShellProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

function OrganizationSettingsShell({
  title,
  description,
  children,
}: OrganizationSettingsShellProps) {
  const pathname = usePathname();
  const activeId =
    ORGANIZATION_SETTINGS_NAV.find((item) => item.href === pathname)?.id ??
    (pathname.startsWith("/settings/members")
      ? "members"
      : pathname.startsWith("/settings/roles")
        ? "roles"
        : "general");

  return (
    <SettingsPageTemplate
      title={title}
      description={description}
      navItems={[...ORGANIZATION_SETTINGS_NAV]}
      activeId={activeId}
    >
      {children}
    </SettingsPageTemplate>
  );
}

export interface OrganizationSettingsGateProps {
  title: string;
  description?: string;
  children: (ctx: { organizationId: string }) => React.ReactNode;
}

/** Stops settings pages from spinning forever when the user has no org or a 403. */
function OrganizationSettingsGate({
  title,
  description,
  children,
}: OrganizationSettingsGateProps) {
  const { organizationId, organization, isLoading, isError, hasNoOrganization } =
    useCurrentOrganization();

  if (isLoading) {
    return (
      <OrganizationSettingsShell title={title} description={description}>
        <OrganizationSettingsSkeleton />
      </OrganizationSettingsShell>
    );
  }

  if (hasNoOrganization || !organizationId) {
    return (
      <OrganizationSettingsShell title={title} description={description}>
        <FeatureEmptyState
          variant="no-data"
          title="No organization selected"
          description="Join or create an organization to view these settings."
          action={
            <Button render={<Link href={routes.app.organizations} />}>View organizations</Button>
          }
        />
      </OrganizationSettingsShell>
    );
  }

  if (isError && !organization) {
    return (
      <OrganizationSettingsShell title={title} description={description}>
        <FeatureEmptyState
          variant="no-permission"
          title="You don't have access to this organization"
          description="Ask an owner or admin to add you as a member, then refresh this page."
          action={
            <Button render={<Link href={routes.app.organizations} />}>View organizations</Button>
          }
        />
      </OrganizationSettingsShell>
    );
  }

  return (
    <OrganizationSettingsShell title={title} description={description}>
      {children({ organizationId })}
    </OrganizationSettingsShell>
  );
}

export { OrganizationSettingsShell, OrganizationSettingsGate };
