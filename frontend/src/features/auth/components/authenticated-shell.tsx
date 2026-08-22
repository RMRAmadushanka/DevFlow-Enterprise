"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { Building2 } from "lucide-react";

import { AppShell } from "@/components/layout/app-shell/app-shell";
import { PermissionProvider } from "@/lib/permissions";
import { routes } from "@/config/routes";
import { FeatureEmptyState } from "@/components/architecture/empty";
import { Button } from "@/components/ui/button";
import { defaultNavGroups, defaultFooterNavItems } from "@/components/layout/sidebar/nav-config";
import { OrganizationSwitcher, useOrganizations, useOrganizationStore, useMyOrgPermissions } from "@/features/organization";
import { useProjects } from "@/features/projects";

import { useLogout } from "../hooks/use-logout";
import { useSessionBootstrap } from "../hooks/use-session";
import { useAuthStore } from "../store/auth.store";
import { isAuthenticated, isKeycloakEnabled } from "@/lib/auth/keycloak";
import { useKeycloakAuthInit, AuthLoading } from "@/lib/auth/keycloak-auth-provider";

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
  const { initStatus } = useKeycloakAuthInit();
  const { isLoading, isFetched } = useSessionBootstrap();
  const user = useAuthStore((s) => s.user);
  const status = useAuthStore((s) => s.status);
  const isSigningOut = useAuthStore((s) => s.isSigningOut);
  const permissions = useAuthStore((s) => s.permissions);
  const { logout, isPending } = useLogout();
  const endingSession = isPending || isSigningOut;
  const { data: organizations = [] } = useOrganizations({
    enabled: status === "authenticated" && !endingSession,
  });
  const currentOrganizationId = useOrganizationStore((s) => s.currentOrganizationId);
  const switchOrganization = useOrganizationStore((s) => s.switchOrganization);
  const sessionOrganizationId = useAuthStore((s) => s.organizationId);
  const { data: projectsResult } = useProjects({
    enabled: status === "authenticated" && !endingSession,
  });

  const activeOrganizationId =
    currentOrganizationId ?? organizations[0]?.id ?? sessionOrganizationId ?? "";

  const shellProjects = React.useMemo(
    () =>
      (projectsResult?.items ?? []).map((project) => ({
        id: project.id,
        name: project.name,
        organizationId: project.organizationId,
        meta: project.key,
      })),
    [projectsResult?.items]
  );

  const { data: orgPermissions, isSuccess: hasOrgPermissions } = useMyOrgPermissions(
    activeOrganizationId || undefined,
    user?.id
  );

  const effectivePermissions = hasOrgPermissions ? orgPermissions : permissions;

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
    if (endingSession) return;
    if (!isFetched || status !== "anonymous") return;
    if (isKeycloakEnabled() && isAuthenticated()) return;
    router.replace(`${routes.auth.login}?next=${encodeURIComponent(pathname)}`);
  }, [isFetched, status, router, pathname, endingSession]);

  React.useEffect(() => {
    if (currentOrganizationId) return;
    const preferred =
      (sessionOrganizationId &&
        organizations.find((org) => org.id === sessionOrganizationId)?.id) ||
      organizations[0]?.id;
    if (preferred) switchOrganization(preferred);
  }, [
    currentOrganizationId,
    organizations,
    sessionOrganizationId,
    switchOrganization,
  ]);

  if (initStatus === "initializing" || isLoading || status === "unknown" || endingSession) {
    return <AuthLoading />;
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
    <PermissionProvider role={user.role} permissions={effectivePermissions}>
      <AppShell
        organizations={organizations.map((org) => ({
          id: org.id,
          name: org.name,
          imageUrl: org.logoUrl,
          meta: org.myRole,
        }))}
        projects={shellProjects}
        activeOrganizationId={activeOrganizationId}
        activeProjectId={shellProjects[0]?.id}
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
        notifications={[]}
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
