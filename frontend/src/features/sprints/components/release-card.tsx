"use client";

import { Calendar, Package, Pencil } from "lucide-react";

import { StatusBadge } from "@/components/data-display/badges";
import type { Tone } from "@/components/data-display/shared/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PermissionGuard } from "@/lib/permissions";
import { cn } from "@/lib/utils";

import type { Release, ReleaseStatus } from "../types/sprint.types";

const RELEASE_TONE: Record<ReleaseStatus, Tone> = {
  planned: "info",
  in_progress: "warning",
  released: "success",
  delayed: "danger",
};

const RELEASE_LABELS: Record<ReleaseStatus, string> = {
  planned: "Planned",
  in_progress: "In progress",
  released: "Released",
  delayed: "Delayed",
};

export interface ReleaseCardProps {
  release: Release;
  className?: string;
  onEdit?: (release: Release) => void;
}

function ReleaseCard({ release, className, onEdit }: ReleaseCardProps) {
  return (
    <Card
      data-slot="release-card"
      className={cn("transition-colors hover:border-ring/40", className)}
    >
      <CardContent className="flex flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="text-base font-semibold text-foreground">{release.name}</h3>
            <p className="text-sm text-muted-foreground">
              {release.version
                ? release.version.startsWith("v")
                  ? release.version
                  : `v${release.version}`
                : "No version"}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <StatusBadge tone={RELEASE_TONE[release.status]} dot size="sm">
              {RELEASE_LABELS[release.status]}
            </StatusBadge>
            {onEdit ? (
              <PermissionGuard permission="sprint.update">
                <Button
                  type="button"
                  size="icon-sm"
                  variant="ghost"
                  aria-label={`Edit ${release.name}`}
                  onClick={() => onEdit(release)}
                >
                  <Pencil className="size-3.5" />
                </Button>
              </PermissionGuard>
            ) : null}
          </div>
        </div>

        {release.description ? (
          <p className="line-clamp-2 text-sm text-muted-foreground">{release.description}</p>
        ) : null}

        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Calendar className="size-3.5" aria-hidden />
            {release.releaseDate}
          </span>
          <span className="inline-flex items-center gap-1">
            <Package className="size-3.5" aria-hidden />
            {release.sprintIds.length} sprints
          </span>
        </div>

        {release.featureNames.length > 0 ? (
          <ul className="flex flex-wrap gap-1">
            {release.featureNames.slice(0, 4).map((feature) => (
              <li
                key={feature}
                className="rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground"
              >
                {feature}
              </li>
            ))}
          </ul>
        ) : null}

        <p className="text-xs text-muted-foreground">{release.projectName}</p>
      </CardContent>
    </Card>
  );
}

export { ReleaseCard };
