import type { Release, Tag } from "../types/repository.types";
import { RepositoryNotFoundError } from "../utils/errors";

const delay = (ms = 200) => new Promise((resolve) => setTimeout(resolve, ms));

const releasesByRepo: Record<string, Release[]> = {
  repo_api_gateway: [
    {
      id: "rel_1_4_0",
      repositoryId: "repo_api_gateway",
      name: "Gateway 1.4.0",
      version: "1.4.0",
      tagName: "v1.4.0",
      notes: "Adaptive rate limiting, auth header deprecation notices, and CI hardening.",
      status: "published",
      publishedAt: "2026-08-06T14:30:00.000Z",
      authorName: "Ava Chen",
      assetCount: 3,
      commitSha: "a1b2c3d4e5f6789012345678abcdef0123456789",
      createdAt: "2026-08-06T14:00:00.000Z",
    },
    {
      id: "rel_1_3_2",
      repositoryId: "repo_api_gateway",
      name: "Gateway 1.3.2",
      version: "1.3.2",
      tagName: "v1.3.2",
      notes: "Patch release for TLS handshake retries.",
      status: "published",
      publishedAt: "2026-07-10T10:00:00.000Z",
      authorName: "Leo Martins",
      assetCount: 3,
      commitSha: "c3d4e5f6789012345678abcdef0123456789aabb",
      createdAt: "2026-07-10T09:00:00.000Z",
    },
    {
      id: "rel_1_5_0_rc",
      repositoryId: "repo_api_gateway",
      name: "Gateway 1.5.0-rc.1",
      version: "1.5.0-rc.1",
      tagName: "v1.5.0-rc.1",
      notes: "Pre-release for quota experiments.",
      status: "prerelease",
      publishedAt: "2026-08-01T12:00:00.000Z",
      authorName: "Mia Patel",
      assetCount: 1,
      commitSha: "bbccddeeff00112233445566778899aabbccddee",
      createdAt: "2026-08-01T11:00:00.000Z",
    },
  ],
  repo_web_console: [
    {
      id: "rel_web_2_1",
      repositoryId: "repo_web_console",
      name: "Console 2.1.0",
      version: "2.1.0",
      tagName: "v2.1.0",
      notes: "Documents module and sprint reporting polish.",
      status: "published",
      publishedAt: "2026-08-02T16:00:00.000Z",
      authorName: "Leo Martins",
      assetCount: 2,
      commitSha: "f9e8d7c6b5a493827160554433221100ffeeddcc",
      createdAt: "2026-08-02T15:00:00.000Z",
    },
  ],
};

const tagsByRepo: Record<string, Tag[]> = {
  repo_api_gateway: [
    {
      id: "tag_v140",
      repositoryId: "repo_api_gateway",
      name: "v1.4.0",
      commitSha: "a1b2c3d4e5f6789012345678abcdef0123456789",
      commitShortSha: "a1b2c3d",
      releaseId: "rel_1_4_0",
      releaseName: "Gateway 1.4.0",
      createdAt: "2026-08-06T14:00:00.000Z",
      authorName: "Ava Chen",
    },
    {
      id: "tag_v132",
      repositoryId: "repo_api_gateway",
      name: "v1.3.2",
      commitSha: "c3d4e5f6789012345678abcdef0123456789aabb",
      commitShortSha: "c3d4e5f",
      releaseId: "rel_1_3_2",
      releaseName: "Gateway 1.3.2",
      createdAt: "2026-07-10T09:00:00.000Z",
      authorName: "Leo Martins",
    },
  ],
};

export const releaseService = {
  async list(repositoryId: string): Promise<Release[]> {
    await delay();
    return structuredClone(releasesByRepo[repositoryId] ?? []);
  },

  async getById(repositoryId: string, releaseId: string): Promise<Release> {
    await delay(150);
    const release = (releasesByRepo[repositoryId] ?? []).find((r) => r.id === releaseId);
    if (!release) throw new RepositoryNotFoundError("Release not found");
    return structuredClone(release);
  },

  async listTags(repositoryId: string): Promise<Tag[]> {
    await delay(160);
    return structuredClone(tagsByRepo[repositoryId] ?? []);
  },
};
