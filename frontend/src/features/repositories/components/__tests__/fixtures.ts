import type {
  Branch,
  Commit,
  FileTreeNode,
  PullRequest,
  Release,
  Repository,
  RepositoryDetail,
} from "../../types/repository.types";

export const sampleRepository: Repository = {
  id: "repo_api_gateway",
  name: "api-gateway",
  fullName: "acme/api-gateway",
  description: "Edge gateway, rate limiting, and auth middleware.",
  organization: "acme",
  organizationId: "org_acme",
  projectId: "proj_api",
  projectName: "API Gateway",
  visibility: "private",
  provider: "github",
  remoteUrl: "https://github.com/acme/api-gateway",
  cloneUrl: "https://github.com/acme/api-gateway.git",
  defaultBranch: "main",
  primaryLanguage: "TypeScript",
  languages: [{ language: "TypeScript", percent: 78, color: "#3178c6" }],
  sizeKb: 18432,
  favorited: true,
  archived: false,
  health: "healthy",
  openPullRequests: 3,
  openIssues: 12,
  contributorCount: 8,
  lastCommitSha: "a1b2c3d4e5f6789012345678abcdef0123456789",
  lastCommitMessage: "feat: tighten rate-limit burst windows",
  lastCommitAt: "2026-08-06T14:00:00.000Z",
  lastCommitAuthor: "Ava Chen",
  stars: 42,
  forks: 6,
  createdAt: "2025-11-02T09:00:00.000Z",
  updatedAt: "2026-08-06T14:00:00.000Z",
};

export const sampleRepositoryDetail: RepositoryDetail = {
  ...sampleRepository,
  statistics: {
    commits: 1400,
    branches: 15,
    tags: 18,
    releases: 9,
    openPullRequests: 3,
    openIssues: 12,
    contributors: 8,
    sizeKb: 18432,
  },
  members: [
    {
      id: "rm_1",
      userId: "user_ava",
      name: "Ava Chen",
      role: "owner",
      permissionLevel: "Admin",
      joinedAt: sampleRepository.createdAt,
    },
  ],
  webhooks: [],
  readmeHtml: "<h1>api-gateway</h1>",
  activity: [
    {
      id: "act_1",
      actorName: "Ava Chen",
      summary: "Pushed to main",
      timestamp: sampleRepository.lastCommitAt,
    },
  ],
};

export const sampleBranches: Branch[] = [
  {
    id: "br_main",
    repositoryId: "repo_api_gateway",
    name: "main",
    protected: true,
    isDefault: true,
    ahead: 0,
    behind: 0,
    lastCommitSha: sampleRepository.lastCommitSha,
    lastCommitMessage: sampleRepository.lastCommitMessage,
    lastCommitAuthor: "Ava Chen",
    updatedAt: sampleRepository.updatedAt,
  },
  {
    id: "br_rate",
    repositoryId: "repo_api_gateway",
    name: "feat/rate-limit",
    protected: false,
    isDefault: false,
    ahead: 4,
    behind: 1,
    lastCommitSha: "bbccddeeff00112233445566778899aabbccddee",
    lastCommitMessage: "feat: adaptive token bucket",
    lastCommitAuthor: "Ava Chen",
    updatedAt: "2026-08-06T10:00:00.000Z",
  },
];

export const sampleCommits: Commit[] = [
  {
    id: "cmt_1",
    repositoryId: "repo_api_gateway",
    sha: sampleRepository.lastCommitSha,
    shortSha: "a1b2c3d",
    message: "feat: tighten rate-limit burst windows",
    authorId: "user_ava",
    authorName: "Ava Chen",
    branch: "main",
    tags: ["v1.4.0"],
    additions: 128,
    deletions: 34,
    filesChanged: 6,
    committedAt: sampleRepository.lastCommitAt,
  },
];

export const sampleReleases: Release[] = [
  {
    id: "rel_1_4_0",
    repositoryId: "repo_api_gateway",
    name: "Gateway 1.4.0",
    version: "1.4.0",
    tagName: "v1.4.0",
    notes: "Adaptive rate limiting.",
    status: "published",
    publishedAt: "2026-08-06T14:30:00.000Z",
    authorName: "Ava Chen",
    assetCount: 3,
    commitSha: sampleRepository.lastCommitSha,
    createdAt: "2026-08-06T14:00:00.000Z",
  },
];

export const samplePullRequests: PullRequest[] = [
  {
    id: "pr_101",
    repositoryId: "repo_api_gateway",
    number: 101,
    title: "Add adaptive rate limiting",
    description: "Introduces burst-aware token buckets.",
    sourceBranch: "feat/rate-limit",
    targetBranch: "main",
    status: "open",
    author: { id: "user_ava", name: "Ava Chen" },
    reviewers: [{ id: "user_leo", name: "Leo Martins", state: "approved" }],
    labels: ["backend"],
    commentCount: 6,
    checksPassing: 8,
    checksTotal: 9,
    createdAt: "2026-08-04T09:00:00.000Z",
    updatedAt: "2026-08-06T10:00:00.000Z",
  },
];

export const sampleFiles: FileTreeNode[] = [
  {
    id: "file_readme",
    name: "README.md",
    path: "README.md",
    type: "file",
    sizeBytes: 1600,
    language: "Markdown",
  },
  {
    id: "folder_src",
    name: "src",
    path: "src",
    type: "folder",
    children: [
      {
        id: "file_main",
        name: "main.ts",
        path: "src/main.ts",
        type: "file",
        sizeBytes: 880,
        language: "TypeScript",
      },
    ],
  },
];
