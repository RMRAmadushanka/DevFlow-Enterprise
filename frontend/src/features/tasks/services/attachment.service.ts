import type { TaskAttachment } from "../types/task.types";
import { TaskNotFoundError } from "../utils/errors";
import { isLiveBackendMode } from "@/lib/api/live-api";
import { taskService } from "./task.service";

const delay = (ms = 250) => new Promise((resolve) => setTimeout(resolve, ms));

const attachmentsByTask = new Map<string, TaskAttachment[]>();
let attachmentSeq = 1;

async function load(taskId: string): Promise<TaskAttachment[]> {
  const detail = await taskService.getById(taskId);
  if (!attachmentsByTask.has(taskId)) {
    // Live tasks return empty attachments; do not invent demo files.
    attachmentsByTask.set(taskId, isLiveBackendMode() ? [] : [...detail.attachments]);
  }
  return attachmentsByTask.get(taskId) ?? [];
}

export const attachmentService = {
  async list(taskId: string): Promise<TaskAttachment[]> {
    await delay();
    return load(taskId);
  },

  async upload(taskId: string, file: { name: string; size: number; mimeType: string }): Promise<TaskAttachment> {
    await delay(500);
    await taskService.getById(taskId);
    const list = await load(taskId);
    attachmentSeq += 1;
    const attachment: TaskAttachment = {
      id: `att_${attachmentSeq}`,
      name: file.name,
      size: file.size,
      mimeType: file.mimeType,
      url: "#",
      uploadedAt: new Date().toISOString(),
      uploadedBy: "Avery Chen",
    };
    attachmentsByTask.set(taskId, [...list, attachment]);
    return attachment;
  },

  async remove(taskId: string, attachmentId: string): Promise<void> {
    await delay(200);
    const list = await load(taskId);
    if (!list.some((item) => item.id === attachmentId)) {
      throw new TaskNotFoundError("Attachment not found");
    }
    attachmentsByTask.set(
      taskId,
      list.filter((item) => item.id !== attachmentId)
    );
  },
};
