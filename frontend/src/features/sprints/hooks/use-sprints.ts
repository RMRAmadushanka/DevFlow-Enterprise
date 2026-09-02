"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import * as React from "react";

import { toast } from "@/components/feedback/toast";
import { routes } from "@/config/routes";

import { sprintKeys } from "../constants/sprint.constants";
import { backlogService } from "../services/backlog.service";
import { releaseService } from "../services/release.service";
import { isSprintApiEnabled } from "../services/sprint-api.service";
import { sprintService } from "../services/sprint.service";
import { useSprintStore } from "../store/sprint.store";
import type {
  CreateReleasePayload,
  CreateSprintPayload,
  UpdateReleasePayload,
  UpdateSprintPayload,
} from "../types/sprint.types";
import { toSprintErrorMessage } from "../utils/errors";
import type { RetroColumnType } from "@/lib/api/types/sprint";

export function useSprints(projectId?: string | null) {
  const filters = useSprintStore((s) => s.filters);
  const sort = useSprintStore((s) => s.sort);
  const effectiveFilters = React.useMemo(
    () => ({
      ...filters,
      projectId: projectId ?? filters.projectId,
    }),
    [filters, projectId]
  );

  return useQuery({
    queryKey: sprintKeys.list({ filters: effectiveFilters, sort }),
    queryFn: () => sprintService.list({ filters: effectiveFilters, sort }),
  });
}

export function useSprint(id: string | undefined) {
  return useQuery({
    queryKey: sprintKeys.detail(id ?? "unknown"),
    queryFn: () => sprintService.getById(id!),
    enabled: Boolean(id),
  });
}

export function useCreateSprint() {
  const queryClient = useQueryClient();
  const router = useRouter();
  return useMutation({
    mutationFn: (payload: CreateSprintPayload) => sprintService.create(payload),
    onSuccess: (sprint) => {
      void queryClient.invalidateQueries({ queryKey: sprintKeys.all });
      toast.success("Sprint created");
      router.push(routes.app.sprint(sprint.id));
    },
    onError: (error) => toast.error(toSprintErrorMessage(error)),
  });
}

export function useUpdateSprint(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateSprintPayload) => sprintService.update(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: sprintKeys.detail(id) });
      void queryClient.invalidateQueries({ queryKey: sprintKeys.lists() });
      toast.success("Sprint updated");
    },
    onError: (error) => toast.error(toSprintErrorMessage(error)),
  });
}

export function useCompleteSprint() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, moveIncompleteToBacklog }: { id: string; moveIncompleteToBacklog?: boolean }) =>
      sprintService.complete(id, moveIncompleteToBacklog),
    onSuccess: (sprint) => {
      void queryClient.invalidateQueries({ queryKey: sprintKeys.all });
      toast.success(`${sprint.name} completed`);
    },
    onError: (error) => toast.error(toSprintErrorMessage(error)),
  });
}

export function useStartSprint() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => sprintService.start(id),
    onSuccess: (sprint) => {
      void queryClient.invalidateQueries({ queryKey: sprintKeys.all });
      toast.success(`${sprint.name} started`);
    },
    onError: (error) => toast.error(toSprintErrorMessage(error)),
  });
}

export function useDeleteSprint() {
  const queryClient = useQueryClient();
  const router = useRouter();
  return useMutation({
    mutationFn: (id: string) => sprintService.delete(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: sprintKeys.all });
      toast.success("Sprint deleted");
      router.push(routes.app.sprints);
    },
    onError: (error) => toast.error(toSprintErrorMessage(error)),
  });
}

export function useArchiveSprint() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => sprintService.archive(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: sprintKeys.all });
      toast.success("Sprint archived");
    },
    onError: (error) => toast.error(toSprintErrorMessage(error)),
  });
}

export function useDuplicateSprint() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => sprintService.duplicate(id),
    onSuccess: (sprint) => {
      void queryClient.invalidateQueries({ queryKey: sprintKeys.all });
      toast.success("Sprint duplicated");
      return sprint;
    },
    onError: (error) => toast.error(toSprintErrorMessage(error)),
  });
}

export function useSprintPlanning(sprintId: string | undefined) {
  return useQuery({
    queryKey: sprintKeys.planning(sprintId ?? "unknown"),
    queryFn: () => sprintService.planning(sprintId!),
    enabled: Boolean(sprintId),
  });
}

export function useMoveTasksToSprint(sprintId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (taskIds: string[]) => sprintService.moveTasksToSprint(sprintId, taskIds),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: sprintKeys.planning(sprintId) });
      void queryClient.invalidateQueries({ queryKey: sprintKeys.detail(sprintId) });
      void queryClient.invalidateQueries({ queryKey: sprintKeys.all });
      toast.success("Tasks moved to sprint");
    },
    onError: (error) => toast.error(toSprintErrorMessage(error)),
  });
}

export function useBacklog(projectId: string | undefined, q = "") {
  return useQuery({
    queryKey: [...sprintKeys.backlog(projectId ?? "unknown"), q],
    queryFn: () => backlogService.list(projectId!, q),
    enabled: Boolean(projectId),
  });
}

export function useMoveBacklogToSprint(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ sprintId, taskIds }: { sprintId: string; taskIds: string[] }) =>
      backlogService.moveToSprint(projectId, sprintId, taskIds),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: sprintKeys.backlog(projectId) });
      void queryClient.invalidateQueries({ queryKey: sprintKeys.all });
      toast.success("Moved to sprint");
    },
    onError: (error) => toast.error(toSprintErrorMessage(error)),
  });
}

export function useReorderBacklog(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (orderedIds: string[]) => backlogService.reorder(projectId, orderedIds),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: sprintKeys.backlog(projectId) });
    },
  });
}

export function useReleases(projectId?: string | null) {
  return useQuery({
    queryKey: sprintKeys.releases(projectId),
    queryFn: () => releaseService.list(projectId),
  });
}

export function useRelease(id: string | undefined) {
  return useQuery({
    queryKey: sprintKeys.release(id ?? "unknown"),
    queryFn: () => releaseService.getById(id!),
    enabled: Boolean(id),
  });
}

export function useCreateRelease() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateReleasePayload) => releaseService.create(payload),
    onSuccess: (release) => {
      void queryClient.invalidateQueries({ queryKey: sprintKeys.releases(release.projectId) });
      void queryClient.invalidateQueries({ queryKey: sprintKeys.releases(null) });
      toast.success("Release created");
    },
    onError: (error) => toast.error(toSprintErrorMessage(error)),
  });
}

export function useUpdateRelease(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateReleasePayload) => releaseService.update(id, payload),
    onSuccess: (release) => {
      void queryClient.invalidateQueries({ queryKey: sprintKeys.release(id) });
      void queryClient.invalidateQueries({ queryKey: sprintKeys.releases(release.projectId) });
      void queryClient.invalidateQueries({ queryKey: sprintKeys.releases(null) });
      toast.success("Release updated");
    },
    onError: (error) => toast.error(toSprintErrorMessage(error)),
  });
}

export function useDeleteRelease(projectId?: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => releaseService.delete(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: sprintKeys.releases(projectId) });
      void queryClient.invalidateQueries({ queryKey: sprintKeys.releases(null) });
      toast.success("Release deleted");
    },
    onError: (error) => toast.error(toSprintErrorMessage(error)),
  });
}

export function useSprintActivity(sprintId: string | undefined) {
  return useQuery({
    queryKey: [...sprintKeys.detail(sprintId ?? "unknown"), "activity"],
    queryFn: () => sprintService.activity(sprintId!),
    enabled: Boolean(sprintId),
  });
}

export function useVelocityHistory(projectId: string | undefined) {
  return useQuery({
    queryKey: [...sprintKeys.all, "velocity-history", projectId ?? "unknown"],
    queryFn: async () => {
      if (!isSprintApiEnabled()) {
        // Artificial delay to surface loading state — the mock resolves synchronously.
        await new Promise((r) => setTimeout(r, 200));
      }
      return sprintService.velocityHistory(projectId);
    },
    enabled: Boolean(projectId),
  });
}

export function useRetrospective(sprintId: string | undefined) {
  return useQuery({
    queryKey: sprintKeys.retrospective(sprintId ?? "unknown"),
    queryFn: () => sprintService.getRetrospective(sprintId!),
    enabled: Boolean(sprintId),
  });
}

export function useCreateRetroItem(sprintId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { columnType: RetroColumnType; text: string }) =>
      sprintService.createRetroItem(sprintId, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: sprintKeys.retrospective(sprintId) });
      toast.success("Retro item added");
    },
    onError: (error) => toast.error(toSprintErrorMessage(error)),
  });
}

export function useVoteRetroItem(sprintId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (itemId: string) => sprintService.voteRetroItem(sprintId, itemId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: sprintKeys.retrospective(sprintId) });
    },
    onError: (error) => toast.error(toSprintErrorMessage(error)),
  });
}

export function usePostRetroComment(sprintId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (text: string) => sprintService.postRetroComment(sprintId, text),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: sprintKeys.retrospective(sprintId) });
      toast.success("Comment posted");
    },
    onError: (error) => toast.error(toSprintErrorMessage(error)),
  });
}

export function useReview(sprintId: string | undefined) {
  return useQuery({
    queryKey: sprintKeys.review(sprintId ?? "unknown"),
    queryFn: () => sprintService.getReview(sprintId!),
    enabled: Boolean(sprintId),
  });
}

export function useUpdateReview(sprintId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { deploymentSummary?: string; teamPerformance?: string }) =>
      sprintService.updateReview(sprintId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: sprintKeys.review(sprintId) });
      toast.success("Sprint review updated");
    },
    onError: (error) => toast.error(toSprintErrorMessage(error)),
  });
}

export function useCapacity(sprintId: string | undefined) {
  return useQuery({
    queryKey: sprintKeys.capacity(sprintId ?? "unknown"),
    queryFn: () => sprintService.getCapacity(sprintId!),
    enabled: Boolean(sprintId),
  });
}

export function useUpdateCapacity(sprintId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (members: Array<{ userId: string; userName: string; capacityPoints: number }>) =>
      sprintService.updateCapacity(sprintId, members),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: sprintKeys.capacity(sprintId) });
      void queryClient.invalidateQueries({ queryKey: sprintKeys.detail(sprintId) });
      toast.success("Capacity updated");
    },
    onError: (error) => toast.error(toSprintErrorMessage(error)),
  });
}
