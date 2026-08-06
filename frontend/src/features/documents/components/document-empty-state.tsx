"use client";

import Link from "next/link";

import { FeatureEmptyState } from "@/components/architecture/empty";
import { Button } from "@/components/ui/button";
import { PermissionGuard } from "@/lib/permissions";
import { routes } from "@/config/routes";

export type DocumentEmptyVariant =
  | "no-documents"
  | "no-results"
  | "no-favorites"
  | "no-comments"
  | "no-templates"
  | "no-shared"
  | "no-recent";

const COPY: Record<
  DocumentEmptyVariant,
  {
    title: string;
    description: string;
    showCreate?: boolean;
    featureVariant: "no-data" | "no-results" | "first-time" | "no-permission";
  }
> = {
  "no-documents": {
    title: "No documents yet",
    description: "Create your first document to capture knowledge for your team.",
    showCreate: true,
    featureVariant: "first-time",
  },
  "no-results": {
    title: "No matching documents",
    description: "Try adjusting search or filters to find what you need.",
    featureVariant: "no-results",
  },
  "no-favorites": {
    title: "No favorites",
    description: "Star documents you use often to keep them here.",
    featureVariant: "no-data",
  },
  "no-comments": {
    title: "No comments yet",
    description: "Start a discussion by leaving the first comment.",
    featureVariant: "no-data",
  },
  "no-templates": {
    title: "No templates",
    description: "Templates help you start docs faster with a consistent structure.",
    featureVariant: "no-data",
  },
  "no-shared": {
    title: "Nothing shared with you",
    description: "Documents shared with you will appear here.",
    featureVariant: "no-data",
  },
  "no-recent": {
    title: "No recent documents",
    description: "Open a document and it will show up in your recent list.",
    featureVariant: "no-data",
  },
};

export interface DocumentEmptyStateProps {
  variant?: DocumentEmptyVariant;
  action?: React.ReactNode;
}

function DocumentEmptyState({ variant = "no-documents", action }: DocumentEmptyStateProps) {
  const copy = COPY[variant];
  return (
    <FeatureEmptyState
      variant={copy.featureVariant}
      title={copy.title}
      description={copy.description}
      action={
        action ??
        (copy.showCreate ? (
          <PermissionGuard permission="document.create">
            <Button render={<Link href={routes.app.documentNew} />}>New document</Button>
          </PermissionGuard>
        ) : undefined)
      }
    />
  );
}

export { DocumentEmptyState };
