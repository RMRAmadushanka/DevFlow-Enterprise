"use client";

import {
  CircleDot,
  GitBranch,
  GitCommitHorizontal,
  GitPullRequest,
  HardDrive,
  Tag,
  Users,
} from "lucide-react";

import { MetricCard } from "@/components/dashboard/cards";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import type { RepositoryStatistics as RepositoryStatisticsType } from "../types/repository.types";
import { formatRepoSize } from "../utils/format";

export interface RepositoryStatisticsProps {
  statistics: RepositoryStatisticsType;
}

function RepositoryStatistics({ statistics }: RepositoryStatisticsProps) {
  return (
    <div
      className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
      data-slot="repository-statistics"
    >
      <MetricCard
        title="Commits"
        value={statistics.commits}
        icon={<GitCommitHorizontal className="size-4" />}
      />
      <MetricCard
        title="Branches"
        value={statistics.branches}
        icon={<GitBranch className="size-4" />}
      />
      <MetricCard
        title="Open PRs"
        value={statistics.openPullRequests}
        icon={<GitPullRequest className="size-4" />}
      />
      <MetricCard
        title="Releases"
        value={statistics.releases}
        icon={<Tag className="size-4" />}
      />
      <MetricCard
        title="Tags"
        value={statistics.tags}
        icon={<Tag className="size-4" />}
      />
      <MetricCard
        title="Open issues"
        value={statistics.openIssues}
        icon={<CircleDot className="size-4" />}
      />
      <MetricCard
        title="Contributors"
        value={statistics.contributors}
        icon={<Users className="size-4" />}
      />
      <MetricCard
        title="Size"
        value={formatRepoSize(statistics.sizeKb)}
        icon={<HardDrive className="size-4" />}
      />
    </div>
  );
}

export interface LanguageBreakdownProps {
  languages: Array<{ language: string; percent: number; color: string }>;
}

function LanguageBreakdown({ languages }: LanguageBreakdownProps) {
  if (languages.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Languages</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No language data yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card data-slot="language-breakdown">
      <CardHeader>
        <CardTitle className="text-base">Languages</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="flex h-2 overflow-hidden rounded-full bg-muted">
          {languages.map((lang) => (
            <span
              key={lang.language}
              className="h-full"
              style={{ width: `${lang.percent}%`, backgroundColor: lang.color }}
              title={`${lang.language} ${lang.percent}%`}
            />
          ))}
        </div>
        <ul className="flex flex-col gap-1.5">
          {languages.map((lang) => (
            <li
              key={lang.language}
              className="flex items-center justify-between text-sm"
            >
              <span className="inline-flex items-center gap-2">
                <span
                  className="size-2.5 rounded-full"
                  style={{ backgroundColor: lang.color }}
                  aria-hidden
                />
                {lang.language}
              </span>
              <span className="tabular-nums text-muted-foreground">
                {lang.percent}%
              </span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

export { RepositoryStatistics, LanguageBreakdown };
