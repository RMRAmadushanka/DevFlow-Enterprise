import type { Commit } from "../types/repository.types";
import { RepositoryNotFoundError } from "../utils/errors";
import { shortSha } from "../utils/format";

const delay = (ms = 200) => new Promise((resolve) => setTimeout(resolve, ms));

const commitsByRepo: Record<string, Commit[]> = {
  repo_api_gateway: [
    {
      id: "cmt_1",
      repositoryId: "repo_api_gateway",
      sha: "a1b2c3d4e5f6789012345678abcdef0123456789",
      shortSha: "a1b2c3d",
      message: "feat: tighten rate-limit burst windows",
      body: "Reduce burst size for anonymous traffic and add metrics.",
      authorId: "user_ava",
      authorName: "Ava Chen",
      branch: "main",
      tags: ["v1.4.0"],
      additions: 128,
      deletions: 34,
      filesChanged: 6,
      committedAt: "2026-08-06T14:00:00.000Z",
    },
    {
      id: "cmt_2",
      repositoryId: "repo_api_gateway",
      sha: "b2c3d4e5f6789012345678abcdef0123456789aa",
      shortSha: "b2c3d4e",
      message: "test: cover gateway retry backoff",
      authorId: "user_leo",
      authorName: "Leo Martins",
      branch: "main",
      tags: [],
      additions: 86,
      deletions: 12,
      filesChanged: 3,
      committedAt: "2026-08-05T18:20:00.000Z",
    },
    {
      id: "cmt_3",
      repositoryId: "repo_api_gateway",
      sha: "c3d4e5f6789012345678abcdef0123456789aabb",
      shortSha: "c3d4e5f",
      message: "chore: bump dependency lockfile",
      authorId: "user_mia",
      authorName: "Mia Patel",
      branch: "main",
      tags: [],
      additions: 2,
      deletions: 2,
      filesChanged: 1,
      committedAt: "2026-08-04T12:00:00.000Z",
    },
    {
      id: "cmt_4",
      repositoryId: "repo_api_gateway",
      sha: "bbccddeeff00112233445566778899aabbccddee",
      shortSha: "bbccdde",
      message: "feat: adaptive token bucket",
      authorId: "user_ava",
      authorName: "Ava Chen",
      branch: "feat/rate-limit",
      tags: [],
      additions: 210,
      deletions: 40,
      filesChanged: 8,
      committedAt: "2026-08-06T10:00:00.000Z",
    },
  ],
  repo_web_console: [
    {
      id: "cmt_w1",
      repositoryId: "repo_web_console",
      sha: "f9e8d7c6b5a493827160554433221100ffeeddcc",
      shortSha: "f9e8d7c",
      message: "fix: stabilize document editor hydration",
      authorId: "user_leo",
      authorName: "Leo Martins",
      branch: "main",
      tags: [],
      additions: 54,
      deletions: 21,
      filesChanged: 4,
      committedAt: "2026-08-06T11:20:00.000Z",
    },
  ],
};

function seedCommits(repositoryId: string): Commit[] {
  return [
    {
      id: `cmt_${repositoryId}_1`,
      repositoryId,
      sha: "0000000000000000000000000000000000000001",
      shortSha: shortSha("0000000000000000000000000000000000000001"),
      message: "Initial commit",
      authorId: "user_ava",
      authorName: "Ava Chen",
      branch: "main",
      tags: [],
      additions: 12,
      deletions: 0,
      filesChanged: 2,
      committedAt: new Date().toISOString(),
    },
  ];
}

export const commitService = {
  async list(repositoryId: string, branch?: string | null): Promise<Commit[]> {
    await delay();
    const items = commitsByRepo[repositoryId] ?? seedCommits(repositoryId);
    if (!branch) return structuredClone(items);
    return structuredClone(items.filter((c) => c.branch === branch));
  },

  async getById(repositoryId: string, commitId: string): Promise<Commit> {
    await delay(150);
    const commit = (commitsByRepo[repositoryId] ?? seedCommits(repositoryId)).find(
      (c) => c.id === commitId || c.sha === commitId || c.shortSha === commitId
    );
    if (!commit) throw new RepositoryNotFoundError("Commit not found");
    return structuredClone(commit);
  },
};
