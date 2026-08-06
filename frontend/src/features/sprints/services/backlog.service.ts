import type { BacklogItem } from "../types/sprint.types";
import { sprintService } from "./sprint.service";

const delay = (ms = 250) => new Promise((resolve) => setTimeout(resolve, ms));

let backlogSeed: BacklogItem[] = [
  {
    id: "task_3",
    key: "MOB-42",
    title: "Offline cache for project list",
    priority: "medium",
    status: "todo",
    storyPoints: 8,
    epicName: "Mobile reliability",
    sprintId: null,
    assigneeName: "Riley Kim",
    projectId: "proj_mobile",
  },
  {
    id: "task_5",
    key: "DOCS-12",
    title: "Document deployment checklist",
    priority: "low",
    status: "backlog",
    storyPoints: 1,
    epicName: "Docs",
    sprintId: null,
    projectId: "proj_docs",
  },
  {
    id: "task_7",
    key: "WEB-91",
    title: "Calendar view foundation",
    priority: "medium",
    status: "blocked",
    storyPoints: 5,
    epicName: "Scheduling",
    sprintId: null,
    assigneeName: "Avery Chen",
    projectId: "proj_web",
  },
  {
    id: "task_9",
    key: "API-110",
    title: "Add request tracing headers",
    priority: "high",
    status: "backlog",
    storyPoints: 3,
    epicName: "Observability",
    sprintId: null,
    projectId: "proj_api",
  },
  {
    id: "task_10",
    key: "WEB-95",
    title: "Keyboard shortcuts for board",
    priority: "low",
    status: "backlog",
    storyPoints: 2,
    epicName: "A11y",
    sprintId: null,
    projectId: "proj_web",
  },
];

export const backlogService = {
  async list(projectId: string, q = ""): Promise<BacklogItem[]> {
    await delay();
    const query = q.trim().toLowerCase();
    return backlogSeed
      .filter((item) => item.projectId === projectId && !item.sprintId)
      .filter((item) => {
        if (!query) return true;
        return [item.key, item.title, item.epicName ?? ""]
          .join(" ")
          .toLowerCase()
          .includes(query);
      })
      .sort((a, b) => (b.storyPoints ?? 0) - (a.storyPoints ?? 0));
  },

  async moveToSprint(projectId: string, sprintId: string, taskIds: string[]) {
    await delay(300);
    const moving = backlogSeed.filter(
      (item) => item.projectId === projectId && taskIds.includes(item.id)
    );
    backlogSeed = backlogSeed.map((item) =>
      taskIds.includes(item.id) ? { ...item, sprintId } : item
    );
    await sprintService.moveTasksToSprint(
      sprintId,
      moving.map((item) => item.id)
    );
    return this.list(projectId);
  },

  async reorder(projectId: string, orderedIds: string[]): Promise<BacklogItem[]> {
    await delay(150);
    const map = new Map(backlogSeed.map((item) => [item.id, item]));
    const reordered = orderedIds
      .map((id) => map.get(id))
      .filter((item): item is BacklogItem => Boolean(item));
    const others = backlogSeed.filter(
      (item) => item.projectId !== projectId || !orderedIds.includes(item.id)
    );
    backlogSeed = [...reordered, ...others];
    return this.list(projectId);
  },
};
