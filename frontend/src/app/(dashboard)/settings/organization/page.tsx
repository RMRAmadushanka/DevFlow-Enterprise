"use client";

import {
  BrandingForm,
  DangerZone,
  OrganizationForm,
  OrganizationSettingsGate,
  useCurrentOrganization,
} from "@/features/organization";

export default function OrganizationSettingsPage() {
  return (
    <OrganizationSettingsGate
      title="Organization"
      description="General settings, branding, and danger zone"
    >
      {() => <OrganizationSettingsContent />}
    </OrganizationSettingsGate>
  );
}

function OrganizationSettingsContent() {
  const { organization: org } = useCurrentOrganization();
  if (!org) return null;

  return (
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
          <p className="text-sm text-muted-foreground">Logo and brand colors with a live preview.</p>
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
  );
}
