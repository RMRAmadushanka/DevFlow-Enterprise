"use client";

import Link from "next/link";

import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { routes } from "@/config/routes";
import { SprintForm } from "@/features/sprints";

export default function NewSprintPage() {
  return (
    <PageContainer className="mx-auto flex max-w-2xl flex-col gap-6">
      <PageHeader
        title="Create sprint"
        description="Plan a time-boxed iteration with goals and capacity."
        breadcrumbs={[
          { label: "Sprints", href: routes.app.sprints },
          { label: "New" },
        ]}
        actions={
          <Button render={<Link href={routes.app.sprints} />} variant="outline">
            Cancel
          </Button>
        }
      />
      <SprintForm mode="create" />
    </PageContainer>
  );
}
