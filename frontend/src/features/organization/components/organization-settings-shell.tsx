"use client";

import * as React from "react";
import { usePathname } from "next/navigation";

import { SettingsPageTemplate } from "@/components/layout/page-templates";

import { ORGANIZATION_SETTINGS_NAV } from "../constants/organization.constants";

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

export { OrganizationSettingsShell };
