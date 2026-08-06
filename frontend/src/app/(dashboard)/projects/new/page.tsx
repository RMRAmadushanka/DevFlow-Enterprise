"use client";

import Link from "next/link";

import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { routes } from "@/config/routes";
import { ProjectForm } from "@/features/projects";

export default function NewProjectPage() {
  return (
    <PageContainer className="mx-auto flex max-w-2xl flex-col gap-6">
      <PageHeader
        title="Create project"
        description="Define a new software project for your organization."
        breadcrumbs={[
          { label: "Projects", href: routes.app.projects },
          { label: "New" },
        ]}
        actions={
          <Button render={<Link href={routes.app.projects} />} variant="outline">
            Cancel
          </Button>
        }
      />
      <ProjectForm mode="create" />
    </PageContainer>
  );
}
