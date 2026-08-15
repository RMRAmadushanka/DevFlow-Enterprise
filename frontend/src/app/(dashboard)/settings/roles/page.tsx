"use client";

import { OrganizationSettingsGate, RoleManagement } from "@/features/organization";

export default function OrganizationRolesSettingsPage() {
  return (
    <OrganizationSettingsGate
      title="Roles"
      description="Default roles, viewers, and the permission matrix"
    >
      {({ organizationId }) => <RoleManagement organizationId={organizationId} />}
    </OrganizationSettingsGate>
  );
}
