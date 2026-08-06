"use client";

import * as React from "react";

import { SelectField } from "@/components/forms/select";

import { TEMPLATE_CATEGORY_OPTIONS } from "../constants/document.constants";
import { useDocumentTemplates } from "../hooks/use-documents";
import type { DocumentTemplate, DocumentTemplateCategory } from "../types/document.types";
import { DocumentEmptyState } from "./document-empty-state";
import { DocumentGridSkeleton } from "./document-skeleton";
import { DocumentTemplateCard } from "./document-template-card";

export interface TemplateGalleryProps {
  onSelect?: (template: DocumentTemplate) => void;
  selectedId?: string | null;
  className?: string;
}

function TemplateGallery({ onSelect, selectedId, className }: TemplateGalleryProps) {
  const [category, setCategory] = React.useState<DocumentTemplateCategory | "all">("all");
  const { data: templates = [], isLoading } = useDocumentTemplates(category);

  return (
    <div className={className} data-slot="template-gallery">
      <div className="mb-4">
        <SelectField
          label="Category"
          value={category}
          onValueChange={(value) => {
            if (value) setCategory(value as DocumentTemplateCategory | "all");
          }}
          options={TEMPLATE_CATEGORY_OPTIONS}
          className="w-[220px]"
          size="sm"
        />
      </div>

      {isLoading ? <DocumentGridSkeleton count={6} /> : null}

      {!isLoading && templates.length === 0 ? (
        <DocumentEmptyState variant="no-templates" />
      ) : null}

      {!isLoading && templates.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {templates.map((template) => (
            <DocumentTemplateCard
              key={template.id}
              template={template}
              selected={selectedId === template.id}
              onUse={onSelect}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

export { TemplateGallery };
