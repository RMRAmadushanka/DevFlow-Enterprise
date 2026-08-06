"use client";

import { Calendar, Package } from "lucide-react";

import { StatusBadge } from "@/components/data-display/badges";
import type { Tone } from "@/components/data-display/shared/types";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

import type { Release, ReleaseStatus } from "../types/repository.types";
import { formatRelativeCommitDate } from "../utils/format";

const RELEASE_TONE: Record<ReleaseStatus, Tone> = {
  draft: "neutral",
  published: "success",
  prerelease: "warning",
  archived: "neutral",
};

const RELEASE_LABELS: Record<ReleaseStatus, string> = {
  draft: "Draft",
  published: "Published",
  prerelease: "Pre-release",
  archived: "Archived",
};

export interface ReleaseCardProps {
  release: Release;
  className?: string;
}

function ReleaseCard({ release, className }: ReleaseCardProps) {
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
              {release.version.startsWith("v") ? release.version : `v${release.version}`}
              {" · "}
              {release.tagName}
            </p>
          </div>
          <StatusBadge tone={RELEASE_TONE[release.status]} size="sm" dot>
            {RELEASE_LABELS[release.status]}
          </StatusBadge>
        </div>

        {release.notes ? (
          <p className="line-clamp-3 text-sm text-muted-foreground">{release.notes}</p>
        ) : null}

        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Calendar className="size-3.5" aria-hidden />
            {release.publishedAt
              ? formatRelativeCommitDate(release.publishedAt)
              : formatRelativeCommitDate(release.createdAt)}
          </span>
          <span className="inline-flex items-center gap-1">
            <Package className="size-3.5" aria-hidden />
            {release.assetCount} assets
          </span>
          <span>{release.authorName}</span>
        </div>
      </CardContent>
    </Card>
  );
}

export { ReleaseCard };
