import { createQueryKeys } from "@/lib/api/query-keys";

import type {
  RepositoryFilters,
  RepositoryProvider,
  RepositorySortField,
  RepositoryVisibility,
} from "../types/repository.types";

export const REPOSITORY_STORAGE_KEY = "devflow.repositories.ui";

export const repositoryKeys = {
  ...createQueryKeys("repositories"),
  branches: (id: string) => [...createQueryKeys("repositories").detail(id), "branches"] as const,
  commits: (id: string, branch?: string | null) =>
    [...createQueryKeys("repositories").detail(id), "commits", branch ?? "default"] as const,
  tags: (id: string) => [...createQueryKeys("repositories").detail(id), "tags"] as const,
  releases: (id: string) => [...createQueryKeys("repositories").detail(id), "releases"] as const,
  pullRequests: (id: string) =>
    [...createQueryKeys("repositories").detail(id), "pull-requests"] as const,
  files: (id: string, path?: string | null) =>
    [...createQueryKeys("repositories").detail(id), "files", path ?? "root"] as const,
  fileContent: (id: string, path: string) =>
    [...createQueryKeys("repositories").detail(id), "file", path] as const,
  webhooks: (id: string) => [...createQueryKeys("repositories").detail(id), "webhooks"] as const,
};

export const DEFAULT_REPOSITORY_FILTERS: RepositoryFilters = {
  q: "",
  visibility: "all",
  language: null,
  provider: "all",
  status: "all",
  archivedOnly: false,
  favoritesOnly: false,
  projectId: null,
};

export const VISIBILITY_LABELS: Record<RepositoryVisibility, string> = {
  private: "Private",
  internal: "Internal",
  public: "Public",
};

export const VISIBILITY_OPTIONS: Array<{
  value: RepositoryVisibility | "all";
  label: string;
}> = [
  { value: "all", label: "All visibility" },
  { value: "private", label: "Private" },
  { value: "internal", label: "Internal" },
  { value: "public", label: "Public" },
];

export const PROVIDER_LABELS: Record<RepositoryProvider, string> = {
  github: "GitHub",
  gitlab: "GitLab",
  bitbucket: "Bitbucket",
  azure_devops: "Azure DevOps",
  local: "Local",
};

export const PROVIDER_OPTIONS: Array<{
  value: RepositoryProvider | "all";
  label: string;
}> = [
  { value: "all", label: "All providers" },
  { value: "github", label: "GitHub" },
  { value: "gitlab", label: "GitLab" },
  { value: "bitbucket", label: "Bitbucket" },
  { value: "azure_devops", label: "Azure DevOps" },
  { value: "local", label: "Local" },
];

export const SORT_OPTIONS: Array<{ value: RepositorySortField; label: string }> = [
  { value: "recently_updated", label: "Recently updated" },
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "name", label: "Name" },
  { value: "stars", label: "Stars" },
  { value: "size", label: "Size" },
];

export const LANGUAGE_OPTIONS = [
  { value: "TypeScript", label: "TypeScript" },
  { value: "JavaScript", label: "JavaScript" },
  { value: "Python", label: "Python" },
  { value: "Go", label: "Go" },
  { value: "Rust", label: "Rust" },
  { value: "Java", label: "Java" },
];

export const STATUS_OPTIONS = [
  { value: "all", label: "All statuses" },
  { value: "active", label: "Active" },
  { value: "archived", label: "Archived" },
];

export const HEALTH_LABELS = {
  healthy: "Healthy",
  at_risk: "At risk",
  critical: "Critical",
  unknown: "Unknown",
} as const;

export const MEMBER_ROLE_LABELS = {
  owner: "Owner",
  maintainer: "Maintainer",
  developer: "Developer",
  reporter: "Reporter",
  guest: "Guest",
} as const;

export const WEBHOOK_EVENT_OPTIONS = [
  { value: "push", label: "Push" },
  { value: "pull_request", label: "Pull request" },
  { value: "release", label: "Release" },
  { value: "tag", label: "Tag" },
  { value: "issue", label: "Issue" },
  { value: "workflow_run", label: "Workflow run" },
];

export const REPOSITORY_DETAIL_TABS = [
  { value: "overview", label: "Overview" },
  { value: "files", label: "Files" },
  { value: "branches", label: "Branches" },
  { value: "commits", label: "Commits" },
  { value: "pull-requests", label: "Pull Requests" },
  { value: "releases", label: "Releases" },
  { value: "members", label: "Members" },
  { value: "webhooks", label: "Webhooks" },
  { value: "settings", label: "Settings" },
] as const;

export const PROJECT_OPTIONS = [
  { value: "proj_api", label: "API Gateway" },
  { value: "proj_web", label: "Web Console" },
  { value: "proj_mobile", label: "Mobile App" },
  { value: "proj_infra", label: "Infrastructure" },
  { value: "proj_docs", label: "Docs Portal" },
];
