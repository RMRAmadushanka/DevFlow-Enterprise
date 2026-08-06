"use client";

import Link from "next/link";

import { StatusBadge } from "@/components/data-display/badges";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PermissionGuard } from "@/lib/permissions";
import { routes } from "@/config/routes";

import { TEMPLATE_CATEGORY_LABELS } from "../constants/document.constants";
import type { DocumentTemplate } from "../types/document.types";

export interface DocumentTemplateCardProps {
  template: DocumentTemplate;
  onUse?: (template: DocumentTemplate) => void;
  selected?: boolean;
  className?: string;
}

function DocumentTemplateCard({
  template,
  onUse,
  selected,
  className,
}: DocumentTemplateCardProps) {
  return (
    <Card
      data-slot="document-template-card"
      className={cn(
        "transition-colors hover:border-ring/40",
        selected && "border-ring ring-1 ring-ring/40",
        className
      )}
    >
      <CardContent className="flex flex-col gap-3 p-4">
        <div className="flex items-start gap-2">
          <span className="text-xl" aria-hidden>
            {template.icon || "📄"}
          </span>
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-semibold text-foreground">{template.name}</h3>
            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
              {template.description}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge tone="info" size="sm">
            {TEMPLATE_CATEGORY_LABELS[template.category]}
          </StatusBadge>
          {template.tags.slice(0, 2).map((tag) => (
            <StatusBadge key={tag} tone="neutral" size="sm">
              {tag}
            </StatusBadge>
          ))}
        </div>
        <PermissionGuard permission="document.create">
          {onUse ? (
            <Button type="button" size="sm" variant="outline" onClick={() => onUse(template)}>
              Use template
            </Button>
          ) : (
            <Button
              render={
                <Link href={`${routes.app.documentNew}?templateId=${template.id}`} />
              }
              size="sm"
              variant="outline"
            >
              Use template
            </Button>
          )}
        </PermissionGuard>
      </CardContent>
    </Card>
  );
}

export { DocumentTemplateCard };
