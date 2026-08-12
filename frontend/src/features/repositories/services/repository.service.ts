import { PROJECT_OPTIONS } from "../constants/repository.constants";
import type {
  ConnectRepositoryPayload,
  CreateRepositoryPayload,
  CreateWebhookPayload,
  FileContent,
  FileTreeNode,
  PullRequest,
  Repository,
  RepositoryDetail,
  RepositoryFilters,
  RepositoryListResult,
  RepositorySortField,
  RepositoryWebhook,
  TransferRepositoryPayload,
  UpdateRepositoryPayload,
  UpdateWebhookPayload,
} from "../types/repository.types";
import { RepositoryNotFoundError, RepositoryValidationError } from "../utils/errors";
import { parseRemoteName, shortSha } from "../utils/format";
import { createStubAwareService } from "@/lib/api/stub-service";
import { isLiveBackendMode } from "@/lib/api/live-api";

const delay = (ms = 260) => new Promise((resolve) => setTimeout(resolve, ms));

function projectName(id?: string | null) {
  if (!id) return undefined;
  return PROJECT_OPTIONS.find((p) => p.value === id)?.label;
}

function seedRepositories(): Repository[] {
  const now = "2026-08-06T14:00:00.000Z";
  return [
    {
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
      languages: [
        { language: "TypeScript", percent: 78, color: "#3178c6" },
        { language: "Go", percent: 14, color: "#00ADD8" },
        { language: "YAML", percent: 8, color: "#cb171e" },
      ],
      sizeKb: 18432,
      favorited: true,
      archived: false,
      health: "healthy",
      openPullRequests: 3,
      openIssues: 12,
      contributorCount: 8,
      lastCommitSha: "a1b2c3d4e5f6789012345678abcdef0123456789",
      lastCommitMessage: "feat: tighten rate-limit burst windows",
      lastCommitAt: now,
      lastCommitAuthor: "Ava Chen",
      stars: 42,
      forks: 6,
      createdAt: "2025-11-02T09:00:00.000Z",
      updatedAt: now,
    },
    {
      id: "repo_web_console",
      name: "web-console",
      fullName: "acme/web-console",
      description: "DevFlow Enterprise web console (Next.js).",
      organization: "acme",
      organizationId: "org_acme",
      projectId: "proj_web",
      projectName: "Web Console",
      visibility: "internal",
      provider: "gitlab",
      remoteUrl: "https://gitlab.com/acme/web-console",
      cloneUrl: "https://gitlab.com/acme/web-console.git",
      defaultBranch: "main",
      primaryLanguage: "TypeScript",
      languages: [
        { language: "TypeScript", percent: 86, color: "#3178c6" },
        { language: "CSS", percent: 10, color: "#563d7c" },
        { language: "Shell", percent: 4, color: "#89e051" },
      ],
      sizeKb: 51200,
      favorited: true,
      archived: false,
      health: "at_risk",
      openPullRequests: 7,
      openIssues: 28,
      contributorCount: 14,
      lastCommitSha: "f9e8d7c6b5a493827160554433221100ffeeddcc",
      lastCommitMessage: "fix: stabilize document editor hydration",
      lastCommitAt: "2026-08-06T11:20:00.000Z",
      lastCommitAuthor: "Leo Martins",
      stars: 18,
      forks: 3,
      createdAt: "2025-09-15T10:00:00.000Z",
      updatedAt: "2026-08-06T11:20:00.000Z",
    },
    {
      id: "repo_mobile",
      name: "mobile-app",
      fullName: "acme/mobile-app",
      description: "React Native client for field engineers.",
      organization: "acme",
      organizationId: "org_acme",
      projectId: "proj_mobile",
      projectName: "Mobile App",
      visibility: "private",
      provider: "bitbucket",
      remoteUrl: "https://bitbucket.org/acme/mobile-app",
      cloneUrl: "https://bitbucket.org/acme/mobile-app.git",
      defaultBranch: "develop",
      primaryLanguage: "TypeScript",
      languages: [
        { language: "TypeScript", percent: 72, color: "#3178c6" },
        { language: "Java", percent: 18, color: "#b07219" },
        { language: "Kotlin", percent: 10, color: "#A97BFF" },
      ],
      sizeKb: 29600,
      favorited: false,
      archived: false,
      health: "healthy",
      openPullRequests: 2,
      openIssues: 9,
      contributorCount: 5,
      lastCommitSha: "11223344556677889900aabbccddeeff00112233",
      lastCommitMessage: "chore: bump offline cache TTL",
      lastCommitAt: "2026-08-05T16:40:00.000Z",
      lastCommitAuthor: "Mia Patel",
      stars: 9,
      forks: 1,
      createdAt: "2026-01-08T12:00:00.000Z",
      updatedAt: "2026-08-05T16:40:00.000Z",
    },
    {
      id: "repo_infra",
      name: "platform-infra",
      fullName: "acme/platform-infra",
      description: "Terraform modules and cluster manifests.",
      organization: "acme",
      organizationId: "org_acme",
      projectId: "proj_infra",
      projectName: "Infrastructure",
      visibility: "private",
      provider: "azure_devops",
      remoteUrl: "https://dev.azure.com/acme/platform/_git/platform-infra",
      cloneUrl: "https://dev.azure.com/acme/platform/_git/platform-infra",
      defaultBranch: "main",
      primaryLanguage: "HCL",
      languages: [
        { language: "HCL", percent: 64, color: "#844FBA" },
        { language: "YAML", percent: 28, color: "#cb171e" },
        { language: "Shell", percent: 8, color: "#89e051" },
      ],
      sizeKb: 8700,
      favorited: false,
      archived: false,
      health: "critical",
      openPullRequests: 1,
      openIssues: 4,
      contributorCount: 4,
      lastCommitSha: "99aa88bb77cc66dd55ee44ff33221100aabbccdd",
      lastCommitMessage: "fix: restore ingress TLS secret mount",
      lastCommitAt: "2026-08-04T08:15:00.000Z",
      lastCommitAuthor: "Noah Kim",
      stars: 5,
      forks: 2,
      createdAt: "2025-06-20T09:00:00.000Z",
      updatedAt: "2026-08-04T08:15:00.000Z",
    },
    {
      id: "repo_legacy",
      name: "legacy-cli",
      fullName: "acme/legacy-cli",
      description: "Archived CLI superseded by web console tooling.",
      organization: "acme",
      organizationId: "org_acme",
      visibility: "public",
      provider: "github",
      remoteUrl: "https://github.com/acme/legacy-cli",
      cloneUrl: "https://github.com/acme/legacy-cli.git",
      defaultBranch: "master",
      primaryLanguage: "Python",
      languages: [{ language: "Python", percent: 100, color: "#3572A5" }],
      sizeKb: 2100,
      favorited: false,
      archived: true,
      health: "unknown",
      openPullRequests: 0,
      openIssues: 0,
      contributorCount: 2,
      lastCommitSha: "deadbeefcafebabe0123456789abcdef01234567",
      lastCommitMessage: "chore: archive repository",
      lastCommitAt: "2025-12-01T10:00:00.000Z",
      lastCommitAuthor: "Ava Chen",
      stars: 3,
      forks: 0,
      createdAt: "2024-03-01T10:00:00.000Z",
      updatedAt: "2025-12-01T10:00:00.000Z",
    },
  ];
}

let repositories = isLiveBackendMode() ? [] : seedRepositories();

const fileTrees: Record<string, FileTreeNode[]> = {
  repo_api_gateway: [
    {
      id: "folder_src",
      name: "src",
      path: "src",
      type: "folder",
      children: [
        {
          id: "folder_features",
          name: "features",
          path: "src/features",
          type: "folder",
          children: [
            {
              id: "file_index",
              name: "index.ts",
              path: "src/features/index.ts",
              type: "file",
              sizeBytes: 420,
              language: "TypeScript",
            },
          ],
        },
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
    {
      id: "file_readme",
      name: "README.md",
      path: "README.md",
      type: "file",
      sizeBytes: 1600,
      language: "Markdown",
    },
    {
      id: "file_pkg",
      name: "package.json",
      path: "package.json",
      type: "file",
      sizeBytes: 980,
      language: "JSON",
    },
  ],
};

const fileContents: Record<string, FileContent> = {
  "repo_api_gateway:README.md": {
    path: "README.md",
    name: "README.md",
    language: "Markdown",
    sizeBytes: 1600,
    sha: "readme01",
    content:
      "# API Gateway\n\nEdge gateway for DevFlow Enterprise.\n\n## Getting started\n\n```bash\npnpm install\npnpm dev\n```\n",
  },
  "repo_api_gateway:src/main.ts": {
    path: "src/main.ts",
    name: "main.ts",
    language: "TypeScript",
    sizeBytes: 880,
    sha: "main0001",
    content:
      "import { createGateway } from './gateway';\n\nasync function main() {\n  const app = await createGateway();\n  await app.listen(8080);\n}\n\nvoid main();\n",
  },
  "repo_api_gateway:package.json": {
    path: "package.json",
    name: "package.json",
    language: "JSON",
    sizeBytes: 980,
    sha: "pkg00001",
    content: '{\n  "name": "api-gateway",\n  "private": true,\n  "version": "1.4.0"\n}\n',
  },
};

const pullRequestsByRepo: Record<string, PullRequest[]> = {
  repo_api_gateway: [
    {
      id: "pr_101",
      repositoryId: "repo_api_gateway",
      number: 101,
      title: "Add adaptive rate limiting",
      description: "Introduces burst-aware token buckets for public routes.",
      sourceBranch: "feat/rate-limit",
      targetBranch: "main",
      status: "open",
      author: { id: "user_ava", name: "Ava Chen" },
      reviewers: [
        { id: "user_leo", name: "Leo Martins", state: "approved" },
        { id: "user_mia", name: "Mia Patel", state: "pending" },
      ],
      labels: ["backend", "reliability"],
      commentCount: 6,
      checksPassing: 8,
      checksTotal: 9,
      createdAt: "2026-08-04T09:00:00.000Z",
      updatedAt: "2026-08-06T10:00:00.000Z",
    },
    {
      id: "pr_98",
      repositoryId: "repo_api_gateway",
      number: 98,
      title: "Docs: gateway auth headers",
      description: "Document deprecated auth header migration.",
      sourceBranch: "docs/auth-headers",
      targetBranch: "main",
      status: "merged",
      author: { id: "user_noah", name: "Noah Kim" },
      reviewers: [{ id: "user_ava", name: "Ava Chen", state: "approved" }],
      labels: ["docs"],
      commentCount: 2,
      checksPassing: 9,
      checksTotal: 9,
      createdAt: "2026-07-28T11:00:00.000Z",
      updatedAt: "2026-07-30T15:00:00.000Z",
      mergedAt: "2026-07-30T15:00:00.000Z",
    },
  ],
  repo_web_console: [
    {
      id: "pr_220",
      repositoryId: "repo_web_console",
      number: 220,
      title: "Knowledge base editor polish",
      description: "Autosave indicator and TipTap toolbar a11y.",
      sourceBranch: "feat/docs-editor",
      targetBranch: "main",
      status: "open",
      author: { id: "user_leo", name: "Leo Martins" },
      reviewers: [{ id: "user_mia", name: "Mia Patel", state: "changes_requested" }],
      labels: ["frontend", "a11y"],
      commentCount: 11,
      checksPassing: 10,
      checksTotal: 12,
      createdAt: "2026-08-05T08:00:00.000Z",
      updatedAt: "2026-08-06T09:00:00.000Z",
    },
  ],
};

const webhooksByRepo: Record<string, RepositoryWebhook[]> = {
  repo_api_gateway: [
    {
      id: "wh_1",
      repositoryId: "repo_api_gateway",
      url: "https://hooks.devflow.app/github/api-gateway",
      events: ["push", "pull_request", "release"],
      status: "active",
      secretConfigured: true,
      lastDeliveryAt: "2026-08-06T13:50:00.000Z",
      lastDeliveryStatus: "success",
      createdAt: "2026-02-01T10:00:00.000Z",
    },
    {
      id: "wh_2",
      repositoryId: "repo_api_gateway",
      url: "https://ci.acme.dev/hooks/gateway",
      events: ["push", "workflow_run"],
      status: "failing",
      secretConfigured: true,
      lastDeliveryAt: "2026-08-06T08:00:00.000Z",
      lastDeliveryStatus: "failed",
      createdAt: "2026-03-12T10:00:00.000Z",
    },
  ],
};

function sortRepositories(items: Repository[], sort: RepositorySortField): Repository[] {
  const sorted = [...items];
  switch (sort) {
    case "name":
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    case "oldest":
      return sorted.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    case "newest":
      return sorted.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    case "stars":
      return sorted.sort((a, b) => b.stars - a.stars);
    case "size":
      return sorted.sort((a, b) => b.sizeKb - a.sizeKb);
    case "recently_updated":
    default:
      return sorted.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }
}

function matchesFilters(repo: Repository, filters: RepositoryFilters): boolean {
  if (filters.archivedOnly && !repo.archived) return false;
  if (!filters.archivedOnly && filters.status === "archived" && !repo.archived) return false;
  if (filters.status === "active" && repo.archived) return false;
  if (!filters.archivedOnly && filters.status === "all" && repo.archived) {
    // include archived only when explicitly filtered
  }
  if (filters.favoritesOnly && !repo.favorited) return false;
  if (filters.visibility !== "all" && repo.visibility !== filters.visibility) return false;
  if (filters.provider !== "all" && repo.provider !== filters.provider) return false;
  if (filters.language && repo.primaryLanguage !== filters.language) return false;
  if (filters.projectId && repo.projectId !== filters.projectId) return false;

  const q = filters.q.trim().toLowerCase();
  if (q) {
    const haystack = [
      repo.name,
      repo.fullName,
      repo.description,
      repo.organization,
      repo.primaryLanguage,
      repo.provider,
    ]
      .join(" ")
      .toLowerCase();
    if (!haystack.includes(q)) return false;
  }
  return true;
}

function toDetail(repo: Repository): RepositoryDetail {
  return {
    ...repo,
    statistics: {
      commits: 1280 + repo.stars * 3,
      branches: 12 + repo.openPullRequests,
      tags: 18,
      releases: 9,
      openPullRequests: repo.openPullRequests,
      openIssues: repo.openIssues,
      contributors: repo.contributorCount,
      sizeKb: repo.sizeKb,
    },
    members: [
      {
        id: "rm_1",
        userId: "user_ava",
        name: "Ava Chen",
        role: "owner",
        permissionLevel: "Admin",
        joinedAt: repo.createdAt,
      },
      {
        id: "rm_2",
        userId: "user_leo",
        name: "Leo Martins",
        role: "maintainer",
        permissionLevel: "Write",
        joinedAt: "2026-01-15T10:00:00.000Z",
      },
      {
        id: "rm_3",
        userId: "user_mia",
        name: "Mia Patel",
        role: "developer",
        permissionLevel: "Write",
        joinedAt: "2026-03-01T10:00:00.000Z",
      },
      {
        id: "rm_4",
        userId: "user_noah",
        name: "Noah Kim",
        role: "reporter",
        permissionLevel: "Read",
        joinedAt: "2026-05-10T10:00:00.000Z",
      },
    ],
    webhooks: webhooksByRepo[repo.id] ?? [],
    readmeHtml: `<h1>${repo.name}</h1><p>${repo.description}</p><pre><code>git clone ${repo.cloneUrl}</code></pre>`,
    activity: [
      {
        id: `act_${repo.id}_1`,
        actorName: repo.lastCommitAuthor,
        summary: `Pushed to ${repo.defaultBranch}: ${repo.lastCommitMessage}`,
        timestamp: repo.lastCommitAt,
      },
      {
        id: `act_${repo.id}_2`,
        actorName: "Leo Martins",
        summary: "Opened a pull request",
        timestamp: "2026-08-05T09:00:00.000Z",
      },
    ],
  };
}

function nextId(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

const mockRepositoryService = {
  async list(params: {
    filters: RepositoryFilters;
    sort: RepositorySortField;
  }): Promise<RepositoryListResult> {
    await delay();
    let items = repositories.filter((r) => matchesFilters(r, params.filters));
    if (!params.filters.archivedOnly && params.filters.status === "all") {
      items = items.filter((r) => !r.archived);
    }
    items = sortRepositories(items, params.sort);
    return { items, total: items.length };
  },

  async getById(id: string): Promise<RepositoryDetail> {
    await delay(200);
    const repo = repositories.find((r) => r.id === id);
    if (!repo) throw new RepositoryNotFoundError();
    return toDetail(repo);
  },

  async create(payload: CreateRepositoryPayload): Promise<RepositoryDetail> {
    await delay(320);
    if (!payload.name?.trim()) throw new RepositoryValidationError("Repository name is required");
    const now = new Date().toISOString();
    const org = payload.organization?.trim() || "acme";
    const repo: Repository = {
      id: nextId("repo"),
      name: payload.name.trim(),
      fullName: `${org}/${payload.name.trim()}`,
      description: payload.description?.trim() ?? "",
      organization: org,
      organizationId: "org_acme",
      projectId: payload.projectId ?? undefined,
      projectName: projectName(payload.projectId),
      visibility: payload.visibility ?? "private",
      provider: payload.provider ?? "local",
      remoteUrl: payload.remoteUrl || `https://git.devflow.local/${org}/${payload.name.trim()}`,
      cloneUrl:
        payload.remoteUrl ||
        `https://git.devflow.local/${org}/${payload.name.trim()}.git`,
      defaultBranch: payload.defaultBranch || "main",
      primaryLanguage: "TypeScript",
      languages: [{ language: "TypeScript", percent: 100, color: "#3178c6" }],
      sizeKb: 12,
      favorited: false,
      archived: false,
      health: "unknown",
      openPullRequests: 0,
      openIssues: 0,
      contributorCount: 1,
      lastCommitSha: "0000000000000000000000000000000000000000",
      lastCommitMessage: "Initial commit",
      lastCommitAt: now,
      lastCommitAuthor: "Ava Chen",
      stars: 0,
      forks: 0,
      createdAt: now,
      updatedAt: now,
    };
    repositories = [repo, ...repositories];
    return toDetail(repo);
  },

  async connect(payload: ConnectRepositoryPayload): Promise<RepositoryDetail> {
    await delay(340);
    if (!payload.remoteUrl) throw new RepositoryValidationError("Repository URL is required");
    const name = payload.name?.trim() || parseRemoteName(payload.remoteUrl);
    return this.create({
      name,
      description: payload.description,
      visibility: payload.visibility,
      defaultBranch: payload.defaultBranch,
      provider: payload.provider,
      remoteUrl: payload.remoteUrl,
      projectId: payload.projectId,
    });
  },

  async update(id: string, payload: UpdateRepositoryPayload): Promise<RepositoryDetail> {
    await delay(260);
    const index = repositories.findIndex((r) => r.id === id);
    if (index < 0) throw new RepositoryNotFoundError();
    const current = repositories[index]!;
    const updated: Repository = {
      ...current,
      name: payload.name?.trim() ?? current.name,
      fullName: payload.name
        ? `${current.organization}/${payload.name.trim()}`
        : current.fullName,
      description: payload.description ?? current.description,
      visibility: payload.visibility ?? current.visibility,
      defaultBranch: payload.defaultBranch ?? current.defaultBranch,
      favorited: payload.favorited ?? current.favorited,
      archived: payload.archived ?? current.archived,
      updatedAt: new Date().toISOString(),
    };
    repositories[index] = updated;
    return toDetail(updated);
  },

  async delete(id: string): Promise<void> {
    await delay(220);
    const exists = repositories.some((r) => r.id === id);
    if (!exists) throw new RepositoryNotFoundError();
    repositories = repositories.filter((r) => r.id !== id);
  },

  async archive(id: string): Promise<RepositoryDetail> {
    return this.update(id, { archived: true });
  },

  async transfer(id: string, payload: TransferRepositoryPayload): Promise<RepositoryDetail> {
    await delay(280);
    const index = repositories.findIndex((r) => r.id === id);
    if (index < 0) throw new RepositoryNotFoundError();
    if (!payload.organization.trim()) {
      throw new RepositoryValidationError("Organization is required");
    }
    const current = repositories[index]!;
    const updated: Repository = {
      ...current,
      organization: payload.organization.trim(),
      fullName: `${payload.organization.trim()}/${current.name}`,
      projectId: payload.projectId ?? undefined,
      projectName: projectName(payload.projectId),
      updatedAt: new Date().toISOString(),
    };
    repositories[index] = updated;
    return toDetail(updated);
  },

  async toggleFavorite(id: string): Promise<RepositoryDetail> {
    const repo = repositories.find((r) => r.id === id);
    if (!repo) throw new RepositoryNotFoundError();
    return this.update(id, { favorited: !repo.favorited });
  },

  async duplicate(id: string): Promise<RepositoryDetail> {
    const repo = repositories.find((r) => r.id === id);
    if (!repo) throw new RepositoryNotFoundError();
    return this.create({
      name: `${repo.name}-copy`,
      description: repo.description,
      visibility: repo.visibility,
      defaultBranch: repo.defaultBranch,
      provider: repo.provider,
      projectId: repo.projectId,
      organization: repo.organization,
    });
  },

  async listPullRequests(repositoryId: string): Promise<PullRequest[]> {
    await delay(200);
    if (!repositories.some((r) => r.id === repositoryId)) throw new RepositoryNotFoundError();
    return structuredClone(pullRequestsByRepo[repositoryId] ?? []);
  },

  async getPullRequest(repositoryId: string, prId: string): Promise<PullRequest> {
    await delay(160);
    const pr = (pullRequestsByRepo[repositoryId] ?? []).find((p) => p.id === prId);
    if (!pr) throw new RepositoryNotFoundError("Pull request not found");
    return structuredClone(pr);
  },

  async listFiles(repositoryId: string): Promise<FileTreeNode[]> {
    await delay(180);
    if (!repositories.some((r) => r.id === repositoryId)) throw new RepositoryNotFoundError();
    return structuredClone(fileTrees[repositoryId] ?? fileTrees.repo_api_gateway ?? []);
  },

  async getFile(repositoryId: string, path: string): Promise<FileContent> {
    await delay(160);
    const key = `${repositoryId}:${path}`;
    const file = fileContents[key] ?? fileContents[`repo_api_gateway:${path}`];
    if (!file) {
      return {
        path,
        name: path.split("/").pop() ?? path,
        language: "Text",
        sizeBytes: 0,
        sha: shortSha(path),
        content: `// Preview placeholder for ${path}\n`,
      };
    }
    return structuredClone(file);
  },

  async listWebhooks(repositoryId: string): Promise<RepositoryWebhook[]> {
    await delay(160);
    if (!repositories.some((r) => r.id === repositoryId)) throw new RepositoryNotFoundError();
    return structuredClone(webhooksByRepo[repositoryId] ?? []);
  },

  async createWebhook(
    repositoryId: string,
    payload: CreateWebhookPayload
  ): Promise<RepositoryWebhook> {
    await delay(220);
    if (!repositories.some((r) => r.id === repositoryId)) throw new RepositoryNotFoundError();
    const webhook: RepositoryWebhook = {
      id: nextId("wh"),
      repositoryId,
      url: payload.url,
      events: payload.events,
      status: "active",
      secretConfigured: payload.secretConfigured ?? true,
      createdAt: new Date().toISOString(),
    };
    webhooksByRepo[repositoryId] = [webhook, ...(webhooksByRepo[repositoryId] ?? [])];
    return webhook;
  },

  async updateWebhook(
    repositoryId: string,
    webhookId: string,
    payload: UpdateWebhookPayload
  ): Promise<RepositoryWebhook> {
    await delay(200);
    const list = webhooksByRepo[repositoryId] ?? [];
    const index = list.findIndex((w) => w.id === webhookId);
    if (index < 0) throw new RepositoryNotFoundError("Webhook not found");
    const updated = {
      ...list[index]!,
      ...payload,
      events: payload.events ?? list[index]!.events,
    };
    list[index] = updated;
    return structuredClone(updated);
  },

  async deleteWebhook(repositoryId: string, webhookId: string): Promise<void> {
    await delay(180);
    const list = webhooksByRepo[repositoryId] ?? [];
    webhooksByRepo[repositoryId] = list.filter((w) => w.id !== webhookId);
  },
};

export const repositoryService = createStubAwareService(
  "Repositories",
  mockRepositoryService,
  [
    "list",
    "getById",
    "listPullRequests",
    "getPullRequest",
    "listFiles",
    "getFile",
    "listWebhooks",
  ]
);
