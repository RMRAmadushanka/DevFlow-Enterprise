"use client";

import Link from "next/link";

import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { routes } from "@/config/routes";
import { RepositoryForm } from "@/features/repositories";

export default function NewRepositoryPage() {
  return (
    <PageContainer className="mx-auto flex max-w-2xl flex-col gap-6">
      <PageHeader
        title="Connect repository"
        description="Link a Git provider repository to DevFlow for branches, commits, and releases."
        breadcrumbs={[
          { label: "Repositories", href: routes.app.repositories },
          { label: "New" },
        ]}
        actions={
          <Button render={<Link href={routes.app.repositories} />} variant="outline">
            Cancel
          </Button>
        }
      />
      <RepositoryForm mode="create" />
    </PageContainer>
  );
}
