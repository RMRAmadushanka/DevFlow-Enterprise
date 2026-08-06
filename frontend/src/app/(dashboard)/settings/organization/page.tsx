"use client";

import {
  BrandingForm,
  DangerZone,
  OrganizationForm,
  OrganizationSettingsShell,
  OrganizationSettingsSkeleton,
  useCurrentOrganization,
  useOrganization,
} from "@/features/organization";

export default function OrganizationSettingsPage() {
  const { organizationId, organization: cached, isLoading: currentLoading } =
    useCurrentOrganization();
  const { data: organization, isLoading } = useOrganization(organizationId ?? undefined);

  const org = organization ?? cached;

  if (currentLoading || isLoading || !org) {
    return (
      <OrganizationSettingsShell title="Organization" description="General settings and branding">
        <OrganizationSettingsSkeleton />
      </OrganizationSettingsShell>
    );
  }

  return (
    <OrganizationSettingsShell
      title="Organization"
      description="General settings, branding, and danger zone"
    >
      <div className="flex flex-col gap-10">
        <section className="flex flex-col gap-4">
          <div>
            <h2 className="text-base font-semibold">General</h2>
            <p className="text-sm text-muted-foreground">
              Name, description, timezone, language, and date format.
            </p>
          </div>
          <OrganizationForm mode="edit" organization={org} />
        </section>

        <section className="flex flex-col gap-4">
          <div>
            <h2 className="text-base font-semibold">Branding</h2>
            <p className="text-sm text-muted-foreground">
              Logo and brand colors with a live preview.
            </p>
          </div>
          <BrandingForm organization={org} />
        </section>

        <section className="flex flex-col gap-4">
          <div>
            <h2 className="text-base font-semibold text-destructive">Danger zone</h2>
            <p className="text-sm text-muted-foreground">
              Transfer ownership or permanently delete this organization.
            </p>
          </div>
          <DangerZone organization={org} />
        </section>
      </div>
    </OrganizationSettingsShell>
  );
}
