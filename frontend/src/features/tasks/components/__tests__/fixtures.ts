import type { Task, TaskChecklistItem, TaskDetail } from "../../types/task.types";
import type { TaskComment } from "../../types/comment.types";

export const sampleTask: Task = {
  id: "task_1",
  key: "API-101",
  title: "Rate limit gateway responses",
  description: "Add sliding-window rate limiting for public API routes.",
  status: "in_progress",
  priority: "high",
  projectId: "proj_api",
  projectName: "API Gateway",
  sprintId: "sprint_25",
  sprintName: "Sprint 25",
  assignee: { id: "2", name: "Sam Rivera", email: "sam@acme.com" },
  reporter: { id: "1", name: "Avery Chen", email: "avery@acme.com" },
  labels: [{ id: "lbl_feature", name: "feature", color: "#2563EB" }],
  storyPoints: 5,
  estimateMinutes: 480,
  dueDate: "2026-08-08",
  attachmentCount: 2,
  commentCount: 3,
  checklistCompleted: 2,
  checklistTotal: 4,
  favorite: true,
  watching: true,
  archived: false,
  createdAt: "2026-07-28T09:00:00.000Z",
  updatedAt: "2026-08-05T10:00:00.000Z",
};

export const sampleChecklist: TaskChecklistItem[] = [
  { id: "chk_1", title: "Design approach", completed: true },
  { id: "chk_2", title: "Implement limiter", completed: true },
  { id: "chk_3", title: "Add tests", completed: false },
  { id: "chk_4", title: "Document config", completed: false },
];

export const sampleComments: TaskComment[] = [
  {
    id: "cmt_1",
    taskId: "task_1",
    authorId: "1",
    authorName: "Avery Chen",
    bodyHtml: "<p>Looks good — please add tests.</p>",
    createdAt: "2026-08-04T11:00:00.000Z",
    updatedAt: "2026-08-04T11:00:00.000Z",
    edited: false,
  },
];

export const sampleTaskDetail: TaskDetail = {
  ...sampleTask,
  checklist: sampleChecklist,
  attachments: [],
  relations: [],
  subtasks: [],
  watchers: [sampleTask.reporter],
  activity: [
    {
      id: "act_1",
      type: "created",
      actorName: "Avery Chen",
      summary: "created this task",
      timestamp: sampleTask.createdAt,
    },
  ],
  history: [],
  timeTracking: { estimatedMinutes: 480, loggedMinutes: 120 },
};
