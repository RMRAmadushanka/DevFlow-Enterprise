import type { Release } from "../types/sprint.types";

const delay = (ms = 250) => new Promise((resolve) => setTimeout(resolve, ms));

const releases: Release[] = [
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

export const releaseService = {
  async list(projectId?: string | null): Promise<Release[]> {
    await delay();
    return releases.filter((release) => !projectId || release.projectId === projectId);
  },

  async getById(id: string): Promise<Release | undefined> {
    await delay();
    return releases.find((release) => release.id === id);
  },
};
