export type RepositoryVisibility = "private" | "internal" | "public";

export type RepositoryProvider = "github" | "gitlab" | "bitbucket" | "azure_devops" | "local";

export type RepositoryHealth = "healthy" | "at_risk" | "critical" | "unknown";

export type RepositoryMemberRole = "owner" | "maintainer" | "developer" | "reporter" | "guest";

export type PullRequestStatus = "open" | "draft" | "merged" | "closed";

export type ReleaseStatus = "draft" | "published" | "prerelease" | "archived";

export type WebhookStatus = "active" | "disabled" | "failing";

export type RepositorySortField =
  | "name"
  | "recently_updated"
  | "newest"
  | "oldest"
  | "stars"
  | "size";

export type RepositoryViewMode = "grid" | "table" | "list";

export type RepositoryDetailTab =
  | "overview"
  | "files"
  | "branches"
  | "commits"
  | "pull-requests"
  | "releases"
  | "members"
  | "webhooks"
  | "settings";

export interface RepositoryFilters {
  q: string;
  visibility: RepositoryVisibility | "all";
  language: string | null;
  provider: RepositoryProvider | "all";
  status: "all" | "active" | "archived";
  archivedOnly: boolean;
  favoritesOnly: boolean;
  projectId: string | null;
}

export interface RepositoryOwner {
  id: string;
  name: string;
  avatarUrl?: string;
}

export interface RepositoryLanguageShare {
  language: string;
  percent: number;
  color: string;
}

export interface RepositoryStatistics {
  commits: number;
  branches: number;
  tags: number;
  releases: number;
  openPullRequests: number;
  openIssues: number;
  contributors: number;
  sizeKb: number;
}

export interface Repository {
  id: string;
  name: string;
  fullName: string;
  description: string;
  organization: string;
  organizationId: string;
  projectId?: string;
  projectName?: string;
  visibility: RepositoryVisibility;
  provider: RepositoryProvider;
  remoteUrl: string;
  cloneUrl: string;
  defaultBranch: string;
  primaryLanguage: string;
  languages: RepositoryLanguageShare[];
  sizeKb: number;
  favorited: boolean;
  archived: boolean;
  health: RepositoryHealth;
  openPullRequests: number;
  openIssues: number;
  contributorCount: number;
  lastCommitSha: string;
  lastCommitMessage: string;
  lastCommitAt: string;
  lastCommitAuthor: string;
  stars: number;
  forks: number;
  createdAt: string;
  updatedAt: string;
}

export interface RepositoryMember {
  id: string;
  userId: string;
  name: string;
  avatarUrl?: string;
  role: RepositoryMemberRole;
  permissionLevel: string;
  joinedAt: string;
}

export interface RepositoryWebhook {
  id: string;
  repositoryId: string;
  url: string;
  events: string[];
  status: WebhookStatus;
  secretConfigured: boolean;
  lastDeliveryAt?: string;
  lastDeliveryStatus?: "success" | "failed";
  createdAt: string;
}

export interface RepositoryDetail extends Repository {
  statistics: RepositoryStatistics;
  members: RepositoryMember[];
  webhooks: RepositoryWebhook[];
  readmeHtml: string;
  activity: Array<{
    id: string;
    actorName: string;
    summary: string;
    timestamp: string;
  }>;
}

export interface Branch {
  id: string;
  repositoryId: string;
  name: string;
  protected: boolean;
  isDefault: boolean;
  ahead: number;
  behind: number;
  lastCommitSha: string;
  lastCommitMessage: string;
  lastCommitAuthor: string;
  updatedAt: string;
}

export interface Commit {
  id: string;
  repositoryId: string;
  sha: string;
  shortSha: string;
  message: string;
  body?: string;
  authorId: string;
  authorName: string;
  authorAvatarUrl?: string;
  branch: string;
  tags: string[];
  additions: number;
  deletions: number;
  filesChanged: number;
  committedAt: string;
}

export interface Tag {
  id: string;
  repositoryId: string;
  name: string;
  commitSha: string;
  commitShortSha: string;
  releaseId?: string;
  releaseName?: string;
  createdAt: string;
  authorName: string;
}

export interface Release {
  id: string;
  repositoryId: string;
  name: string;
  version: string;
  tagName: string;
  notes: string;
  status: ReleaseStatus;
  publishedAt?: string;
  authorName: string;
  assetCount: number;
  commitSha: string;
  createdAt: string;
}

export interface PullRequestReviewer {
  id: string;
  name: string;
  avatarUrl?: string;
  state: "pending" | "approved" | "changes_requested";
}

export interface PullRequest {
  id: string;
  repositoryId: string;
  number: number;
  title: string;
  description: string;
  sourceBranch: string;
  targetBranch: string;
  status: PullRequestStatus;
  author: RepositoryOwner;
  reviewers: PullRequestReviewer[];
  labels: string[];
  commentCount: number;
  checksPassing: number;
  checksTotal: number;
  createdAt: string;
  updatedAt: string;
  mergedAt?: string;
}

export interface FileTreeNode {
  id: string;
  name: string;
  path: string;
  type: "file" | "folder";
  sizeBytes?: number;
  language?: string;
  children?: FileTreeNode[];
}

export interface FileContent {
  path: string;
  name: string;
  language: string;
  sizeBytes: number;
  content: string;
  sha: string;
}

export interface RepositoryListResult {
  items: Repository[];
  total: number;
}

export interface CreateRepositoryPayload {
  name: string;
  description?: string;
  visibility?: RepositoryVisibility;
  defaultBranch?: string;
  provider?: RepositoryProvider;
  remoteUrl?: string;
  projectId?: string | null;
  organization?: string;
}

export interface ConnectRepositoryPayload {
  provider: RepositoryProvider;
  remoteUrl: string;
  name?: string;
  description?: string;
  visibility?: RepositoryVisibility;
  defaultBranch?: string;
  projectId?: string | null;
}

export interface UpdateRepositoryPayload {
  name?: string;
  description?: string;
  visibility?: RepositoryVisibility;
  defaultBranch?: string;
  favorited?: boolean;
  archived?: boolean;
}

export interface TransferRepositoryPayload {
  organization: string;
  projectId?: string | null;
}

export interface CreateWebhookPayload {
  url: string;
  events: string[];
  secretConfigured?: boolean;
}

export interface UpdateWebhookPayload {
  url?: string;
  events?: string[];
  status?: WebhookStatus;
  secretConfigured?: boolean;
}
