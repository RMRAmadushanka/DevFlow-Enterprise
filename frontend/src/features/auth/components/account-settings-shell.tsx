"use client";

import * as React from "react";
import { usePathname } from "next/navigation";

import { SettingsPageTemplate } from "@/components/layout/page-templates";
import { ACCOUNT_NAV } from "../constants/auth.constants";

export interface AccountSettingsShellProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

function AccountSettingsShell({ title, description, children }: AccountSettingsShellProps) {
  const pathname = usePathname();
  const activeId =
    ACCOUNT_NAV.find((item) => item.href === pathname)?.id ??
    (pathname.startsWith("/account/security")
      ? "security"
      : pathname.startsWith("/profile")
        ? "profile"
        : "preferences");

  return (
    <SettingsPageTemplate
      title={title}
      description={description}
      navItems={[...ACCOUNT_NAV]}
      activeId={activeId}
    >
      {children}
    </SettingsPageTemplate>
  );
}

export { AccountSettingsShell };
