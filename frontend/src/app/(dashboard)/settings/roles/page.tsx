"use client";

import {
  OrganizationSettingsShell,
  OrganizationSettingsSkeleton,
  RoleManagement,
  useCurrentOrganization,
} from "@/features/organization";

export default function OrganizationRolesSettingsPage() {
  const { organizationId, isLoading } = useCurrentOrganization();

  if (isLoading || !organizationId) {
    return (
      <OrganizationSettingsShell title="Roles" description="Roles and permission matrix">
        <OrganizationSettingsSkeleton />
      </OrganizationSettingsShell>
    );
  }

  return (
    <OrganizationSettingsShell
      title="Roles"
      description="Default roles, viewers, and the permission matrix"
    >
      <RoleManagement organizationId={organizationId} />
    </OrganizationSettingsShell>
  );
}
