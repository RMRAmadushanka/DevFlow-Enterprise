"use client";

import { StatusBadge } from "@/components/data-display/badges";
import { UserAvatar, UserAvatarGroup } from "@/components/data-display/avatars";
import { ActivityTimeline } from "@/components/data-display/activity";
import type { Tone } from "@/components/data-display/shared/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { HEALTH_LABELS } from "../constants/repository.constants";
import type {
  RepositoryDetail,
  RepositoryHealth,
} from "../types/repository.types";
import { formatRelativeCommitDate } from "../utils/format";
import {
  LanguageBreakdown,
  RepositoryStatistics,
} from "./repository-statistics";

const HEALTH_TONE: Record<RepositoryHealth, Tone> = {
  healthy: "success",
  at_risk: "warning",
  critical: "danger",
  unknown: "neutral",
};

export interface RepositoryOverviewProps {
  repository: RepositoryDetail;
}

function RepositoryOverview({ repository }: RepositoryOverviewProps) {
  return (
    <div className="flex flex-col gap-6" data-slot="repository-overview">
      <RepositoryStatistics statistics={repository.statistics} />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Latest commit</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {repository.lastCommitMessage ? (
              <>
                <p className="text-sm font-medium text-foreground">
                  {repository.lastCommitMessage}
                </p>
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <span className="font-mono">{repository.lastCommitSha?.slice(0, 7)}</span>
                  <span>·</span>
                  <span>{repository.lastCommitAuthor}</span>
                  {repository.lastCommitAt ? (
                    <>
                      <span>·</span>
                      <time dateTime={repository.lastCommitAt}>
                        {formatRelativeCommitDate(repository.lastCommitAt)}
                      </time>
                    </>
                  ) : null}
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">No commits yet.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0">
            <CardTitle className="text-base">Health</CardTitle>
            <StatusBadge tone={HEALTH_TONE[repository.health]} size="sm" dot>
              {HEALTH_LABELS[repository.health]}
            </StatusBadge>
          </CardHeader>
          <CardContent className="flex flex-col gap-2 text-sm text-muted-foreground">
            <p>
              {repository.openPullRequests} open pull requests ·{" "}
              {repository.openIssues} open issues
            </p>
            <p>
              Default branch <span className="font-medium text-foreground">{repository.defaultBranch}</span>
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <LanguageBreakdown languages={repository.languages} />

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top contributors</CardTitle>
          </CardHeader>
          <CardContent>
            {repository.members.length > 0 ? (
              <ul className="flex flex-col gap-3">
                {repository.members.slice(0, 5).map((member) => (
                  <li key={member.id} className="flex items-center gap-3">
                    <UserAvatar
                      user={{
                        id: member.userId,
                        name: member.name,
                        imageUrl: member.avatarUrl,
                      }}
                      size="sm"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">
                        {member.name}
                      </p>
                      <p className="text-xs capitalize text-muted-foreground">
                        {member.role}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex flex-col gap-3">
                <UserAvatarGroup
                  users={Array.from(
                    { length: Math.min(repository.contributorCount, 5) },
                    (_, i) => ({
                      id: `${repository.id}-tc-${i}`,
                      name: `Contributor ${i + 1}`,
                    })
                  )}
                  max={5}
                  size="sm"
                />
                <p className="text-sm text-muted-foreground">
                  {repository.contributorCount} contributors
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent activity</CardTitle>
        </CardHeader>
        <CardContent>
          {repository.activity.length > 0 ? (
            <ActivityTimeline
              items={repository.activity.map((entry) => ({
                id: entry.id,
                action: entry.summary,
                description: entry.actorName,
                timestamp: entry.timestamp,
              }))}
            />
          ) : (
            <p className="text-sm text-muted-foreground">No recent activity.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export { RepositoryOverview };
