import type { Branch } from "../types/repository.types";
import { RepositoryNotFoundError } from "../utils/errors";

const delay = (ms = 200) => new Promise((resolve) => setTimeout(resolve, ms));

const branchesByRepo: Record<string, Branch[]> = {
  repo_api_gateway: [
    {
      id: "br_main",
      repositoryId: "repo_api_gateway",
      name: "main",
      protected: true,
      isDefault: true,
      ahead: 0,
      behind: 0,
      lastCommitSha: "a1b2c3d4e5f6789012345678abcdef0123456789",
      lastCommitMessage: "feat: tighten rate-limit burst windows",
      lastCommitAuthor: "Ava Chen",
      updatedAt: "2026-08-06T14:00:00.000Z",
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
    {
      id: "br_docs",
      repositoryId: "repo_api_gateway",
      name: "docs/auth-headers",
      protected: false,
      isDefault: false,
      ahead: 0,
      behind: 2,
      lastCommitSha: "ccddeeff00112233445566778899aabbccddeeff",
      lastCommitMessage: "docs: auth header migration",
      lastCommitAuthor: "Noah Kim",
      updatedAt: "2026-07-30T12:00:00.000Z",
    },
  ],
  repo_web_console: [
    {
      id: "br_web_main",
      repositoryId: "repo_web_console",
      name: "main",
      protected: true,
      isDefault: true,
      ahead: 0,
      behind: 0,
      lastCommitSha: "f9e8d7c6b5a493827160554433221100ffeeddcc",
      lastCommitMessage: "fix: stabilize document editor hydration",
      lastCommitAuthor: "Leo Martins",
      updatedAt: "2026-08-06T11:20:00.000Z",
    },
    {
      id: "br_docs_editor",
      repositoryId: "repo_web_console",
      name: "feat/docs-editor",
      protected: false,
      isDefault: false,
      ahead: 12,
      behind: 3,
      lastCommitSha: "1122aabbccddeeff99887766554433221100ffee",
      lastCommitMessage: "feat: TipTap toolbar a11y",
      lastCommitAuthor: "Leo Martins",
      updatedAt: "2026-08-06T09:00:00.000Z",
    },
  ],
};

function defaultBranches(repositoryId: string): Branch[] {
  return [
    {
      id: `br_${repositoryId}_main`,
      repositoryId,
      name: "main",
      protected: true,
      isDefault: true,
      ahead: 0,
      behind: 0,
      lastCommitSha: "0000000000000000000000000000000000000001",
      lastCommitMessage: "Initial commit",
      lastCommitAuthor: "Ava Chen",
      updatedAt: new Date().toISOString(),
    },
  ];
}

export const branchService = {
  async list(repositoryId: string, q = ""): Promise<Branch[]> {
    await delay();
    const items = branchesByRepo[repositoryId] ?? defaultBranches(repositoryId);
    const query = q.trim().toLowerCase();
    if (!query) return structuredClone(items);
    return structuredClone(items.filter((b) => b.name.toLowerCase().includes(query)));
  },

  async getDefault(repositoryId: string): Promise<Branch> {
    const items = await this.list(repositoryId);
    const main = items.find((b) => b.isDefault) ?? items[0];
    if (!main) throw new RepositoryNotFoundError("No branches found");
    return main;
  },
};
