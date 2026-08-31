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
import type { CreateSprintPayload, UpdateSprintPayload } from "../types/sprint.types";
import { toSprintErrorMessage } from "../utils/errors";

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
    mutationFn: (id: string) => sprintService.complete(id),
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
