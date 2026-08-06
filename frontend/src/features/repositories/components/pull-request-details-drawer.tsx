"use client";

import * as React from "react";

import { StatusBadge } from "@/components/data-display/badges";
import { UserAvatar } from "@/components/data-display/avatars";
import { ActivityTimeline } from "@/components/data-display/activity";
import { DetailDrawer } from "@/components/feedback/drawer";
import { Button } from "@/components/ui/button";

import { usePullRequest } from "../hooks/use-repositories";
import { formatRelativeCommitDate } from "../utils/format";
import { PrSkeleton } from "./repository-skeleton";

type PrTab = "conversation" | "files" | "checks" | "activity";

export interface PullRequestDetailsDrawerProps {
  repositoryId: string;
  pullRequestId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function PullRequestDetailsDrawer({
  repositoryId,
  pullRequestId,
  open,
  onOpenChange,
}: PullRequestDetailsDrawerProps) {
  const { data: pr, isLoading } = usePullRequest(
    repositoryId,
    pullRequestId ?? undefined
  );
  const [tab, setTab] = React.useState<PrTab>("conversation");

  React.useEffect(() => {
    if (open) setTab("conversation");
  }, [open, pullRequestId]);

  const tabs: Array<{ value: PrTab; label: string }> = [
    { value: "conversation", label: "Conversation" },
    { value: "files", label: "Files Changed" },
    { value: "checks", label: "Checks" },
    { value: "activity", label: "Activity" },
  ];

  return (
    <DetailDrawer
      open={open}
      onOpenChange={onOpenChange}
      title={pr ? `#${pr.number} ${pr.title}` : "Pull request"}
      size="lg"
    >
      {isLoading ? <PrSkeleton /> : null}
      {!isLoading && pr ? (
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <UserAvatar
              user={{
                id: pr.author.id,
                name: pr.author.name,
                imageUrl: pr.author.avatarUrl,
              }}
              size="sm"
            />
            <span>{pr.author.name}</span>
            <span>·</span>
            <span>
              {pr.sourceBranch} → {pr.targetBranch}
            </span>
            <time dateTime={pr.createdAt}>
              {formatRelativeCommitDate(pr.createdAt)}
            </time>
          </div>

          <div role="tablist" aria-label="Pull request sections" className="flex flex-wrap gap-1">
            {tabs.map((t) => (
              <Button
                key={t.value}
                type="button"
                size="sm"
                variant={tab === t.value ? "secondary" : "ghost"}
                role="tab"
                aria-selected={tab === t.value}
                onClick={() => setTab(t.value)}
              >
                {t.label}
              </Button>
            ))}
          </div>

          {tab === "conversation" ? (
            <div className="flex flex-col gap-3">
              <p className="whitespace-pre-wrap text-sm text-foreground">
                {pr.description || "No description provided."}
              </p>
              <p className="text-sm text-muted-foreground">
                {pr.commentCount} comments · {pr.reviewers.length} reviewers
              </p>
              {pr.labels.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {pr.labels.map((label) => (
                    <StatusBadge key={label} tone="neutral" size="sm">
                      {label}
                    </StatusBadge>
                  ))}
                </div>
              ) : null}
            </div>
          ) : null}

          {tab === "files" ? (
            <div className="rounded-lg border border-border p-4">
              <p className="text-sm text-muted-foreground">
                Files changed UI placeholder. Diff viewer will render here.
              </p>
              <ul className="mt-3 flex flex-col gap-2 text-sm">
                <li className="font-mono text-foreground">src/example.ts</li>
                <li className="font-mono text-foreground">README.md</li>
              </ul>
            </div>
          ) : null}

          {tab === "checks" ? (
            <div className="flex flex-col gap-2">
              <p className="text-sm text-muted-foreground">
                {pr.checksPassing} of {pr.checksTotal} checks passing
              </p>
              {Array.from({ length: pr.checksTotal || 3 }, (_, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm"
                >
                  <span>Check {i + 1}</span>
                  <StatusBadge
                    tone={i < pr.checksPassing ? "success" : "danger"}
                    size="sm"
                    dot
                  >
                    {i < pr.checksPassing ? "Passed" : "Failed"}
                  </StatusBadge>
                </div>
              ))}
            </div>
          ) : null}

          {tab === "activity" ? (
            <ActivityTimeline
              items={[
                {
                  id: `${pr.id}-created`,
                  action: "opened this pull request",
                  description: pr.author.name,
                  timestamp: pr.createdAt,
                },
                {
                  id: `${pr.id}-updated`,
                  action: "updated the pull request",
                  description: pr.author.name,
                  timestamp: pr.updatedAt,
                },
                ...(pr.mergedAt
                  ? [
                      {
                        id: `${pr.id}-merged`,
                        action: "merged this pull request",
                        description: pr.author.name,
                        timestamp: pr.mergedAt,
                      },
                    ]
                  : []),
              ]}
            />
          ) : null}
        </div>
      ) : null}
      {!isLoading && !pr && pullRequestId ? (
        <p className="text-sm text-muted-foreground">Pull request not found.</p>
      ) : null}
    </DetailDrawer>
  );
}

export { PullRequestDetailsDrawer };
