"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

import { FeatureEmptyState } from "@/components/architecture/empty";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { routes } from "@/config/routes";
import { DocumentForm, useDocument } from "@/features/documents";

export default function EditDocumentPage() {
  const params = useParams<{ documentId: string }>();
  const { data: document, isLoading, isError } = useDocument(params.documentId);

  if (isLoading) {
    return (
      <PageContainer className="p-6">
        <div className="text-sm text-muted-foreground">Loading document…</div>
      </PageContainer>
    );
  }

  if (isError || !document) {
    return (
      <FeatureEmptyState
        variant="no-results"
        title="Document not found"
        description="This document may have been deleted or you no longer have access."
        action={
          <Button render={<Link href={routes.app.documents} />}>Back to documents</Button>
        }
      />
    );
  }

  return (
    <PageContainer className="mx-auto flex max-w-2xl flex-col gap-6">
      <PageHeader
        title={`Edit ${document.title}`}
        description="Update content and document settings."
        breadcrumbs={[
          { label: "Documents", href: routes.app.documents },
          { label: document.title, href: routes.app.document(document.id) },
          { label: "Edit" },
        ]}
        actions={
          <Button render={<Link href={routes.app.document(document.id)} />} variant="outline">
            Cancel
          </Button>
        }
      />
      <DocumentForm mode="edit" document={document} />
    </PageContainer>
  );
}
