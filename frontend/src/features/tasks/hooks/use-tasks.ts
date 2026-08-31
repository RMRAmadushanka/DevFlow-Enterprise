"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import * as React from "react";

import { toast } from "@/components/feedback/toast";
import { routes } from "@/config/routes";

import { taskKeys } from "../constants/task.constants";
import { attachmentService } from "../services/attachment.service";
import { commentService } from "../services/comment.service";
import { taskService } from "../services/task.service";
import { useTaskStore } from "../store/task.store";
import type {
  BulkTaskUpdate,
  CreateTaskPayload,
  TaskChecklistItem,
  TaskStatus,
  UpdateTaskPayload,
} from "../types/task.types";
import type { CreateCommentPayload, UpdateCommentPayload } from "../types/comment.types";
import { toTaskErrorMessage } from "../utils/errors";

export function useTaskFilters() {
  const filters = useTaskStore((s) => s.filters);
  const sort = useTaskStore((s) => s.sort);
  const setFilters = useTaskStore((s) => s.setFilters);
  const setSearch = useTaskStore((s) => s.setSearch);
  const setSort = useTaskStore((s) => s.setSort);
  const resetFilters = useTaskStore((s) => s.resetFilters);
  return { filters, sort, setFilters, setSearch, setSort, resetFilters };
}

export function useTasks(projectId?: string | null) {
  const { filters, sort } = useTaskFilters();
  const effectiveFilters = React.useMemo(
    () => ({
      ...filters,
      projectId: projectId ?? filters.projectId,
    }),
    [filters, projectId]
  );

  return useQuery({
    queryKey: taskKeys.list({ filters: effectiveFilters, sort }),
    queryFn: () => taskService.list({ filters: effectiveFilters, sort }),
  });
}

export function useTask(id: string | undefined) {
  return useQuery({
    queryKey: taskKeys.detail(id ?? "unknown"),
    queryFn: () => taskService.getById(id!),
    enabled: Boolean(id),
  });
}

export function useTaskBoard(projectId?: string | null) {
  const collapsedColumns = useTaskStore((s) => s.collapsedColumns);
  const toggleColumnCollapsed = useTaskStore((s) => s.toggleColumnCollapsed);

  const query = useQuery({
    queryKey: taskKeys.board(projectId),
    queryFn: () => taskService.board(projectId),
  });

  return {
    ...query,
    collapsedColumns,
    toggleColumnCollapsed,
  };
}

export function useCreateTask() {
  const queryClient = useQueryClient();
  const router = useRouter();
  return useMutation({
    mutationFn: (payload: CreateTaskPayload) => taskService.create(payload),
    onSuccess: (task) => {
      void queryClient.invalidateQueries({ queryKey: taskKeys.all });
      toast.success("Task created");
      router.push(routes.app.task(task.id));
    },
    onError: (error) => toast.error(toTaskErrorMessage(error)),
  });
}

export function useUpdateTask(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateTaskPayload) => taskService.update(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: taskKeys.detail(id) });
      void queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: taskKeys.all });
      toast.success("Task updated");
    },
    onError: (error) => toast.error(toTaskErrorMessage(error)),
  });
}

export function useMoveTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: TaskStatus }) =>
      taskService.move(id, status),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: taskKeys.all });
    },
    onError: (error) => toast.error(toTaskErrorMessage(error)),
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();
  const router = useRouter();
  return useMutation({
    mutationFn: (id: string) => taskService.delete(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: taskKeys.all });
      toast.success("Task deleted");
      router.push(routes.app.tasks);
    },
    onError: (error) => toast.error(toTaskErrorMessage(error)),
  });
}

export function useArchiveTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => taskService.update(id, { archived: true, status: "archived" }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: taskKeys.all });
      toast.success("Task archived");
    },
    onError: (error) => toast.error(toTaskErrorMessage(error)),
  });
}

export function useDuplicateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => taskService.duplicate(id),
    onSuccess: (task) => {
      void queryClient.invalidateQueries({ queryKey: taskKeys.all });
      toast.success("Task duplicated");
      return task;
    },
    onError: (error) => toast.error(toTaskErrorMessage(error)),
  });
}

export function useBulkUpdateTasks() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: BulkTaskUpdate) => taskService.bulkUpdate(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: taskKeys.all });
      toast.success("Tasks updated");
    },
    onError: (error) => toast.error(toTaskErrorMessage(error)),
  });
}

export function useToggleTaskFavorite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => taskService.toggleFavorite(id),
    onSuccess: (task) => {
      void queryClient.invalidateQueries({ queryKey: taskKeys.detail(task.id) });
      void queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
    },
  });
}

export function useToggleTaskWatch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => taskService.toggleWatch(id),
    onSuccess: (task) => {
      void queryClient.invalidateQueries({ queryKey: taskKeys.detail(task.id) });
    },
  });
}

export function useUpdateChecklist(taskId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (checklist: TaskChecklistItem[]) =>
      taskService.updateChecklist(taskId, checklist),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: taskKeys.detail(taskId) });
    },
    onError: (error) => toast.error(toTaskErrorMessage(error)),
  });
}

export function useLogTime(taskId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { minutes: number; note?: string }) =>
      taskService.logTime(taskId, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: taskKeys.detail(taskId) });
      toast.success("Time logged");
    },
    onError: (error) => toast.error(toTaskErrorMessage(error)),
  });
}

export function useCreateTaskRelation(taskId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { type: import("../types/task.types").TaskRelationType; targetTaskId: string }) =>
      taskService.createRelation(taskId, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: taskKeys.detail(taskId) });
      toast.success("Task linked");
    },
    onError: (error) => toast.error(toTaskErrorMessage(error)),
  });
}

export function useDeleteTaskRelation(taskId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (relationId: string) => taskService.deleteRelation(taskId, relationId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: taskKeys.detail(taskId) });
      toast.success("Link removed");
    },
    onError: (error) => toast.error(toTaskErrorMessage(error)),
  });
}

export function useTaskComments(taskId: string | undefined) {
  return useQuery({
    queryKey: taskKeys.comments(taskId ?? "unknown"),
    queryFn: () => commentService.list(taskId!),
    enabled: Boolean(taskId),
  });
}

export function useCreateComment(taskId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Omit<CreateCommentPayload, "taskId">) =>
      commentService.create({ ...payload, taskId }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: taskKeys.comments(taskId) });
      void queryClient.invalidateQueries({ queryKey: taskKeys.detail(taskId) });
      toast.success("Comment added");
    },
    onError: (error) => toast.error(toTaskErrorMessage(error)),
  });
}

export function useUpdateComment(taskId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateCommentPayload }) =>
      commentService.update(id, taskId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: taskKeys.comments(taskId) });
    },
    onError: (error) => toast.error(toTaskErrorMessage(error)),
  });
}

export function useDeleteComment(taskId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => commentService.delete(id, taskId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: taskKeys.comments(taskId) });
      toast.success("Comment deleted");
    },
    onError: (error) => toast.error(toTaskErrorMessage(error)),
  });
}

export function useTaskAttachments(taskId: string | undefined) {
  return useQuery({
    queryKey: taskKeys.attachments(taskId ?? "unknown"),
    queryFn: () => attachmentService.list(taskId!),
    enabled: Boolean(taskId),
  });
}

export function useUploadAttachment(taskId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file: { name: string; size: number; mimeType: string }) =>
      attachmentService.upload(taskId, file),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: taskKeys.attachments(taskId) });
      void queryClient.invalidateQueries({ queryKey: taskKeys.detail(taskId) });
      toast.success("Attachment uploaded");
    },
    onError: (error) => toast.error(toTaskErrorMessage(error)),
  });
}

export function useRemoveAttachment(taskId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (attachmentId: string) => attachmentService.remove(taskId, attachmentId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: taskKeys.attachments(taskId) });
      void queryClient.invalidateQueries({ queryKey: taskKeys.detail(taskId) });
      toast.success("Attachment removed");
    },
    onError: (error) => toast.error(toTaskErrorMessage(error)),
  });
}
