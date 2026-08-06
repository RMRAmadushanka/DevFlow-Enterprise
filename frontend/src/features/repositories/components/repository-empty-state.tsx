"use client";

import Link from "next/link";

import { FeatureEmptyState } from "@/components/architecture/empty";
import { Button } from "@/components/ui/button";
import { PermissionGuard } from "@/lib/permissions";
import { routes } from "@/config/routes";

export type RepositoryEmptyVariant =
  | "no-repositories"
  | "no-results"
  | "no-branches"
  | "no-commits"
  | "no-releases"
  | "no-pull-requests"
  | "no-files"
  | "no-webhooks";

const COPY: Record<
  RepositoryEmptyVariant,
  {
    title: string;
    description: string;
    showCreate?: boolean;
    featureVariant: "no-data" | "no-results" | "first-time" | "no-permission";
  }
> = {
  "no-repositories": {
    title: "No repositories yet",
    description: "Create or connect a repository to start managing source control.",
    showCreate: true,
    featureVariant: "first-time",
  },
  "no-results": {
    title: "No matching repositories",
    description: "Try adjusting search or filters to find what you need.",
    featureVariant: "no-results",
  },
  "no-branches": {
    title: "No branches",
    description: "Branches will appear once this repository has commits.",
    featureVariant: "no-data",
  },
  "no-commits": {
    title: "No commits",
    description: "Push your first commit to see history here.",
    featureVariant: "no-data",
  },
  "no-releases": {
    title: "No releases",
    description: "Publish a release to track versions and notes.",
    featureVariant: "no-data",
  },
  "no-pull-requests": {
    title: "No pull requests",
    description: "Open a pull request to collaborate on changes.",
    featureVariant: "no-data",
  },
  "no-files": {
    title: "No files",
    description: "This repository does not contain any files yet.",
    featureVariant: "no-data",
  },
  "no-webhooks": {
    title: "No webhooks",
    description: "Add a webhook to receive repository event notifications.",
    featureVariant: "no-data",
  },
};

export interface RepositoryEmptyStateProps {
  variant?: RepositoryEmptyVariant;
  action?: React.ReactNode;
}

function RepositoryEmptyState({
  variant = "no-repositories",
  action,
}: RepositoryEmptyStateProps) {
  const copy = COPY[variant];
  return (
    <FeatureEmptyState
      variant={copy.featureVariant}
      title={copy.title}
      description={copy.description}
      action={
        action ??
        (copy.showCreate ? (
          <PermissionGuard permission="repository.create">
            <Button render={<Link href={routes.app.repositoryNew} />}>
              Create repository
            </Button>
          </PermissionGuard>
        ) : undefined)
      }
    />
  );
}

export { RepositoryEmptyState };
