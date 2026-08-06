"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { FeatureEmptyState } from "@/components/architecture/empty";
import { routes } from "@/config/routes";
import {
  OrganizationSettingsSkeleton,
  TeamSettings,
  useOrganization,
} from "@/features/organization";

export default function OrganizationTeamsPage() {
  const params = useParams<{ id: string }>();
  const { data: organization, isLoading, isError } = useOrganization(params.id);

  if (isLoading) {
    return (
      <div className="p-6">
        <OrganizationSettingsSkeleton />
      </div>
    );
  }

  if (isError || !organization) {
    return (
      <FeatureEmptyState
        variant="no-results"
        title="Organization not found"
        description="Unable to load teams for this organization."
        action={
          <Button render={<Link href={routes.app.organizations} />}>
            Back to organizations
          </Button>
        }
      />
    );
  }

  return (
    <PageContainer className="flex flex-col gap-6">
      <PageHeader
        title={`${organization.name} teams`}
        description="Create teams and assign members for delivery ownership."
        breadcrumbs={[
          { label: "Organizations", href: routes.app.organizations },
          { label: organization.name, href: routes.app.organization(organization.id) },
          { label: "Teams" },
        ]}
      />
      <TeamSettings organizationId={organization.id} showHeaderLink={false} />
    </PageContainer>
  );
}
