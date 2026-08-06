"use client";

import { ListPageTemplate } from "@/components/layout/page-templates";
import { routes } from "@/config/routes";

import { DocumentLayout } from "./document-layout";
import { RecentDocuments } from "./recent-documents";

function RecentView() {
  return (
    <ListPageTemplate
      title="Recent"
      description="Documents you opened recently."
      breadcrumbs={[
        { label: "Workspace", href: routes.app.home },
        { label: "Documents", href: routes.app.documents },
        { label: "Recent" },
      ]}
    >
      <DocumentLayout>
        <RecentDocuments limit={20} />
      </DocumentLayout>
    </ListPageTemplate>
  );
}

export { RecentView };
