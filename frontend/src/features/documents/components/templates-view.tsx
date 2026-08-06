"use client";

import { ListPageTemplate } from "@/components/layout/page-templates";
import { routes } from "@/config/routes";

import { DocumentLayout } from "./document-layout";
import { TemplateGallery } from "./template-gallery";

function TemplatesView() {
  return (
    <ListPageTemplate
      title="Templates"
      description="Start faster with reusable document templates."
      breadcrumbs={[
        { label: "Workspace", href: routes.app.home },
        { label: "Documents", href: routes.app.documents },
        { label: "Templates" },
      ]}
    >
      <DocumentLayout>
        <TemplateGallery />
      </DocumentLayout>
    </ListPageTemplate>
  );
}

export { TemplatesView };
