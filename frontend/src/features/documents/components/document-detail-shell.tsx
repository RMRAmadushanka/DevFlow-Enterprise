"use client";

import * as React from "react";
import Link from "next/link";
import { Pencil } from "lucide-react";

import { DetailPageTemplate } from "@/components/layout/page-templates";
import { FeatureEmptyState } from "@/components/architecture/empty";
import { Button } from "@/components/ui/button";
import { PermissionGuard } from "@/lib/permissions";
import { routes } from "@/config/routes";

import { DOCUMENT_DETAIL_TABS } from "../constants/document.constants";
import { useDocument, useUpdateDocument } from "../hooks/use-documents";
import { useDocumentStore } from "../store/document.store";
import type { DocumentDetailTab } from "../types/document.types";
import { DocumentActivity } from "./document-activity";
import { DocumentAnalytics } from "./document-analytics";
import { DocumentComments } from "./document-comments";
import { DocumentEditor } from "./document-editor";
import { DocumentHeader } from "./document-header";
import { DocumentHistory } from "./document-history";
import { DocumentSkeleton } from "./document-skeleton";
import { DocumentViewer } from "./document-viewer";
import { DeleteDocumentModal } from "./delete-document-modal";
import { MarkdownEditor } from "./markdown-editor";
import { MoveDocumentModal } from "./move-document-modal";
import { PermissionsPanel } from "./permission-modal";
import { ShareDocumentModal } from "./share-document-modal";

export interface DocumentDetailShellProps {
  documentId: string;
  initialTab?: DocumentDetailTab;
}

function DocumentDetailShell({
  documentId,
  initialTab = "content",
}: DocumentDetailShellProps) {
  const { data: doc, isLoading, isError } = useDocument(documentId);
  const update = useUpdateDocument(documentId);
  const editorMode = useDocumentStore((s) => s.editorMode);
  const setEditorMode = useDocumentStore((s) => s.setEditorMode);

  const [activeTab, setActiveTab] = React.useState<DocumentDetailTab>(initialTab);
  const [shareOpen, setShareOpen] = React.useState(false);
  const [moveOpen, setMoveOpen] = React.useState(false);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [editing, setEditing] = React.useState(false);
  const [draftHtml, setDraftHtml] = React.useState("");
  const [draftMarkdown, setDraftMarkdown] = React.useState("");

  React.useEffect(() => {
    if (!doc) return;
    setDraftHtml(doc.contentHtml);
    setDraftMarkdown(doc.contentMarkdown);
  }, [doc]);

  if (isLoading) {
    return (
      <div className="p-6">
        <DocumentSkeleton />
      </div>
    );
  }

  if (isError || !doc) {
    return (
      <FeatureEmptyState
        variant="no-results"
        title="Document not found"
        description="This document may have been deleted or you no longer have access."
        action={<Button render={<Link href={routes.app.documents} />}>Back to documents</Button>}
      />
    );
  }

  return (
    <>
      <DetailPageTemplate
        title={doc.title}
        description={doc.description}
        breadcrumbs={[
          { label: "Documents", href: routes.app.documents },
          { label: doc.title },
        ]}
        actions={
          <>
            <PermissionGuard permission="document.update">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setEditing((v) => !v);
                  setActiveTab("content");
                }}
              >
                <Pencil className="size-4" />
                {editing ? "Preview" : "Edit"}
              </Button>
            </PermissionGuard>
            <PermissionGuard permission="document.update">
              <Button render={<Link href={routes.app.documentEdit(doc.id)} />} variant="outline">
                Full page edit
              </Button>
            </PermissionGuard>
            <PermissionGuard permission="document.delete">
              <Button type="button" variant="outline" onClick={() => setDeleteOpen(true)}>
                Delete
              </Button>
            </PermissionGuard>
          </>
        }
        tabs={DOCUMENT_DETAIL_TABS.map(({ value, label }) => ({ value, label }))}
        activeTab={activeTab}
        onTabChange={(value) => setActiveTab(value as DocumentDetailTab)}
      >
        <div className="flex flex-col gap-6">
          <DocumentHeader
            document={doc}
            mode="detail"
            onShare={() => setShareOpen(true)}
            onMove={() => setMoveOpen(true)}
            onDelete={() => setDeleteOpen(true)}
          />

          {activeTab === "content" ? (
            <div className="flex flex-col gap-3">
              {editing ? (
                <>
                  <div
                    role="group"
                    aria-label="Editor mode"
                    className="flex items-center gap-1"
                  >
                    <Button
                      type="button"
                      size="sm"
                      variant={editorMode === "rich" ? "secondary" : "ghost"}
                      aria-pressed={editorMode === "rich"}
                      onClick={() => setEditorMode("rich")}
                    >
                      Rich text
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant={editorMode === "markdown" ? "secondary" : "ghost"}
                      aria-pressed={editorMode === "markdown"}
                      onClick={() => setEditorMode("markdown")}
                    >
                      Markdown
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      className="ml-auto"
                      disabled={update.isPending}
                      onClick={() =>
                        void update.mutateAsync({
                          contentHtml: draftHtml,
                          contentMarkdown: draftMarkdown,
                        })
                      }
                    >
                      Save content
                    </Button>
                  </div>
                  {editorMode === "markdown" ? (
                    <MarkdownEditor
                      label="Document content"
                      value={draftMarkdown}
                      onValueChange={setDraftMarkdown}
                    />
                  ) : (
                    <DocumentEditor value={draftHtml} onChange={setDraftHtml} />
                  )}
                </>
              ) : (
                <DocumentViewer document={doc} />
              )}
            </div>
          ) : null}

          {activeTab === "comments" ? <DocumentComments documentId={documentId} /> : null}

          {activeTab === "history" ? <DocumentHistory documentId={documentId} /> : null}

          {activeTab === "analytics" ? <DocumentAnalytics analytics={doc.analytics} /> : null}

          {activeTab === "permissions" ? (
            <div className="space-y-4">
              <PermissionsPanel permissions={doc.permissions} />
              <DocumentActivity items={doc.activity} title="Access activity" />
            </div>
          ) : null}
        </div>
      </DetailPageTemplate>

      <ShareDocumentModal
        document={doc}
        open={shareOpen}
        onOpenChange={setShareOpen}
      />
      <MoveDocumentModal document={doc} open={moveOpen} onOpenChange={setMoveOpen} />
      <DeleteDocumentModal document={doc} open={deleteOpen} onOpenChange={setDeleteOpen} />
    </>
  );
}

export { DocumentDetailShell };
