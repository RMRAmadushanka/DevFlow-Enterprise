"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { Building2 } from "lucide-react";

import { AppShell } from "@/components/layout/app-shell/app-shell";
import { PermissionProvider } from "@/lib/permissions";
import { routes } from "@/config/routes";
import { sampleNotifications, sampleProjects } from "@/components/layout/sample-data";
import { FeatureEmptyState } from "@/components/architecture/empty";
import { Button } from "@/components/ui/button";
import { defaultNavGroups, defaultFooterNavItems } from "@/components/layout/sidebar/nav-config";
import { OrganizationSwitcher, useOrganizations, useOrganizationStore } from "@/features/organization";

import { useLogout } from "../hooks/use-logout";
import { useSessionBootstrap } from "../hooks/use-session";
import { useAuthStore } from "../store/auth.store";
import { ProfileSkeleton } from "./skeletons";

export interface AuthenticatedShellProps {
  children: React.ReactNode;
}

/**
 * Dashboard chrome for authenticated account routes.
 * Organization switching is provided by the organization feature module.
 */
function AuthenticatedShell({ children }: AuthenticatedShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isLoading, isFetched } = useSessionBootstrap();
  const user = useAuthStore((s) => s.user);
  const status = useAuthStore((s) => s.status);
  const permissions = useAuthStore((s) => s.permissions);
  const { logout, isPending } = useLogout();
  const { data: organizations = [] } = useOrganizations();
  const currentOrganizationId = useOrganizationStore((s) => s.currentOrganizationId);
  const switchOrganization = useOrganizationStore((s) => s.switchOrganization);

  const activeOrganizationId =
    currentOrganizationId ?? organizations[0]?.id ?? "org_demo";

  const orgProjects = sampleProjects.filter(
    (project) => project.organizationId === activeOrganizationId
  );

  const navGroups = React.useMemo(() => {
    const [workspace, ...rest] = defaultNavGroups;
    const workspaceItems = [
      {
        id: "organizations",
        label: "Organizations",
        href: routes.app.organizations,
        icon: Building2,
      },
      ...(workspace?.items ?? []),
    ];
    return [
      {
        id: workspace?.id ?? "workspace",
        label: workspace?.label ?? "Workspace",
        items: workspaceItems,
      },
      ...rest,
    ];
  }, []);

  const footerNav = React.useMemo(
    () => ({
      ...defaultFooterNavItems,
      items: defaultFooterNavItems.items.map((item) =>
        item.id === "settings"
          ? { ...item, href: routes.app.settings.organization }
          : item
      ),
    }),
    []
  );

  React.useEffect(() => {
    if (isFetched && status === "anonymous") {
      router.replace(`${routes.auth.login}?next=${encodeURIComponent(pathname)}`);
    }
  }, [isFetched, status, router, pathname]);

  React.useEffect(() => {
    if (!currentOrganizationId && organizations[0]) {
      switchOrganization(organizations[0].id);
    }
  }, [currentOrganizationId, organizations, switchOrganization]);

  if (isLoading || status === "unknown") {
    return (
      <div className="p-6">
        <ProfileSkeleton />
      </div>
    );
  }

  if (!user) {
    return (
      <FeatureEmptyState
        variant="no-permission"
        title="Sign in required"
        description="Sign in to manage your account."
        action={
          <Button render={<Link href={routes.auth.login} />}>Sign in</Button>
        }
      />
    );
  }

  return (
    <PermissionProvider role={user.role} permissions={permissions}>
      <AppShell
        organizations={organizations.map((org) => ({
          id: org.id,
          name: org.name,
          imageUrl: org.logoUrl,
          meta: org.myRole,
        }))}
        projects={orgProjects.length > 0 ? orgProjects : sampleProjects}
        activeOrganizationId={activeOrganizationId}
        activeProjectId={orgProjects[0]?.id ?? sampleProjects[0]?.id}
        onSelectOrganization={(id) => {
          switchOrganization(id);
          router.push(routes.app.organization(id));
        }}
        onCreateWorkspace={() => router.push(routes.app.organizationNew)}
        onWorkspaceSettingsClick={() => router.push(routes.app.settings.organization)}
        renderWorkspaceSwitcher={({ collapsed }) => (
          <OrganizationSwitcher collapsed={collapsed} />
        )}
        navGroups={navGroups}
        footerNavGroup={footerNav}
        user={{
          id: user.id,
          name: user.name,
          email: user.email,
          avatarUrl: user.avatarUrl,
          role: user.role,
        }}
        breadcrumbs={[
          { label: "Workspace" },
          { label: pathname.split("/").filter(Boolean).at(-1) ?? "Home" },
        ]}
        notifications={sampleNotifications}
        onProfileClick={() => router.push(routes.app.profile)}
        onAccountSettingsClick={() => router.push(routes.app.account.settings)}
        onLogout={() => {
          if (!isPending) void logout();
        }}
      >
        {children}
      </AppShell>
    </PermissionProvider>
  );
}

export { AuthenticatedShell };
