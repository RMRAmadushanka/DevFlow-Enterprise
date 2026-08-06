"use client";

import Link from "next/link";

import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { routes } from "@/config/routes";
import { OrganizationForm } from "@/features/organization";

export default function NewOrganizationPage() {
  return (
    <PageContainer className="mx-auto max-w-2xl flex flex-col gap-6">
      <PageHeader
        title="Create organization"
        description="Set up a new workspace for your engineering teams."
        breadcrumbs={[
          { label: "Organizations", href: routes.app.organizations },
          { label: "New" },
        ]}
        actions={
          <Button render={<Link href={routes.app.organizations} />} variant="outline">
            Cancel
          </Button>
        }
      />
      <OrganizationForm mode="create" />
    </PageContainer>
  );
}
