import { PROJECT_OPTIONS } from "../constants/sprint.constants";
import type { CreateReleasePayload, Release, UpdateReleasePayload } from "../types/sprint.types";
import { SprintNotFoundError, SprintValidationError } from "../utils/errors";
import { releaseApiService } from "./release-api.service";
import { isSprintApiEnabled } from "./sprint-api.service";

const delay = (ms = 250) => new Promise((resolve) => setTimeout(resolve, ms));

function projectName(id: string) {
  return PROJECT_OPTIONS.find((p) => p.value === id)?.label ?? "Unknown project";
}

let releases: Release[] = [
  {
    id: "rel_1_4",
    name: "Gateway Reliability",
    version: "v1.4.0",
    projectId: "proj_api",
    projectName: "API Gateway",
    releaseDate: "2026-08-15",
    status: "in_progress",
    sprintIds: ["sprint_24", "sprint_25"],
    featureNames: ["Rate limiting", "Auth deprecation", "Tracing"],
    description: "Hardening the edge gateway for production traffic.",
  },
  {
    id: "rel_2_0",
    name: "Console Experience",
    version: "v2.0.0",
    projectId: "proj_web",
    projectName: "Web Console",
    releaseDate: "2026-09-30",
    status: "planned",
    sprintIds: ["sprint_26"],
    featureNames: ["Calendar foundation", "Board shortcuts"],
    description: "Major UX improvements for operators.",
  },
  {
    id: "rel_mobile_1",
    name: "Mobile Offline",
    version: "v1.2.0",
    projectId: "proj_mobile",
    projectName: "Mobile App",
    releaseDate: "2026-08-20",
    status: "planned",
    sprintIds: [],
    featureNames: ["Offline cache"],
    description: "First offline-capable release.",
  },
];

let sequence = 10;

const mockReleaseService = {
  async list(projectId?: string | null): Promise<Release[]> {
    await delay();
    return releases.filter((release) => !projectId || release.projectId === projectId);
  },

  async getById(id: string): Promise<Release | undefined> {
    await delay();
    return releases.find((release) => release.id === id);
  },

  async create(payload: CreateReleasePayload): Promise<Release> {
    await delay(300);
    if (!payload.name?.trim()) throw new SprintValidationError("Release name is required");
    if (!payload.projectId) throw new SprintValidationError("Project is required");
    sequence += 1;
    const release: Release = {
      id: `rel_mock_${sequence}`,
      name: payload.name.trim(),
      version: payload.version?.trim() ?? "",
      projectId: payload.projectId,
      projectName: projectName(payload.projectId),
      releaseDate: payload.releaseDate ?? "",
      status: payload.status,
      sprintIds: [],
      featureNames: payload.features ?? [],
      description: payload.description ?? "",
    };
    releases = [release, ...releases];
    return release;
  },

  async update(id: string, payload: UpdateReleasePayload): Promise<Release> {
    await delay(280);
    const index = releases.findIndex((release) => release.id === id);
    if (index < 0) throw new SprintNotFoundError("Release not found");
    const current = releases[index];
    const next: Release = {
      ...current,
      name: payload.name?.trim() ?? current.name,
      version: payload.version?.trim() ?? current.version,
      description: payload.description ?? current.description,
      status: payload.status ?? current.status,
      releaseDate: payload.releaseDate ?? current.releaseDate,
      featureNames: payload.features ?? current.featureNames,
    };
    releases[index] = next;
    return next;
  },

  async delete(id: string): Promise<void> {
    await delay(200);
    if (!releases.some((release) => release.id === id)) {
      throw new SprintNotFoundError("Release not found");
    }
    releases = releases.filter((release) => release.id !== id);
  },
};

export const releaseService = new Proxy(mockReleaseService, {
  get(target, prop, receiver) {
    if (isSprintApiEnabled()) {
      const live = Reflect.get(releaseApiService, prop, releaseApiService);
      if (typeof live === "function") {
        return (live as (...args: unknown[]) => unknown).bind(releaseApiService);
      }
    }
    const value = Reflect.get(target, prop, receiver);
    return typeof value === "function" ? value.bind(target) : value;
  },
});
