"use client";

import Link from "next/link";

import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { routes } from "@/config/routes";
import { DocumentForm } from "@/features/documents";

export default function NewDocumentPage() {
  return (
    <PageContainer className="mx-auto flex max-w-2xl flex-col gap-6">
      <PageHeader
        title="Create document"
        description="Add a new page to the knowledge base."
        breadcrumbs={[
          { label: "Documents", href: routes.app.documents },
          { label: "New" },
        ]}
        actions={
          <Button render={<Link href={routes.app.documents} />} variant="outline">
            Cancel
          </Button>
        }
      />
      <DocumentForm mode="create" />
    </PageContainer>
  );
}
