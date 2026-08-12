"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import * as React from "react";

import { toast } from "@/components/feedback/toast";
import { routes } from "@/config/routes";
import { useOrganizationStore } from "@/features/organization";

import { projectKeys } from "../constants/project.constants";
import { projectService } from "../services/project.service";
import { useProjectStore } from "../store/project.store";
import type {
  CreateProjectPayload,
  UpdateProjectPayload,
} from "../types/project.types";
import { toProjectErrorMessage } from "../utils/errors";

export function useProjects(options?: { enabled?: boolean }) {
  const filters = useProjectStore((s) => s.filters);
  const sort = useProjectStore((s) => s.sort);
  const currentOrganizationId = useOrganizationStore((s) => s.currentOrganizationId);

  const effectiveFilters = React.useMemo(
    () => ({
      ...filters,
      organizationId: filters.organizationId ?? currentOrganizationId,
    }),
    [filters, currentOrganizationId]
  );

  return useQuery({
    queryKey: projectKeys.list({ filters: effectiveFilters, sort }),
    queryFn: () => projectService.list({ filters: effectiveFilters, sort }),
    enabled: options?.enabled ?? true,
  });
}

export function useProject(id: string | undefined) {
  return useQuery({
    queryKey: projectKeys.detail(id ?? "unknown"),
    queryFn: () => projectService.getById(id!),
    enabled: Boolean(id),
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (payload: CreateProjectPayload) => projectService.create(payload),
    onSuccess: (project) => {
      void queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
      toast.success("Project created");
      router.push(routes.app.project(project.id));
    },
    onError: (error) => toast.error(toProjectErrorMessage(error)),
  });
}

export function useUpdateProject(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateProjectPayload) => projectService.update(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: projectKeys.detail(id) });
      void queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
      toast.success("Project updated");
    },
    onError: (error) => toast.error(toProjectErrorMessage(error)),
  });
}

export function useToggleFavorite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => projectService.toggleFavorite(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: projectKeys.lists() });
      await queryClient.cancelQueries({ queryKey: projectKeys.detail(id) });
      const previousDetail = queryClient.getQueryData(projectKeys.detail(id));
      queryClient.setQueryData(projectKeys.detail(id), (current: unknown) => {
        if (!current || typeof current !== "object") return current;
        const project = current as { favorite?: boolean };
        return { ...project, favorite: !project.favorite };
      });
      return { previousDetail, id };
    },
    onError: (error, id, context) => {
      if (context?.previousDetail) {
        queryClient.setQueryData(projectKeys.detail(id), context.previousDetail);
      }
      toast.error(toProjectErrorMessage(error));
    },
    onSettled: (project) => {
      void queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
      if (project) {
        void queryClient.invalidateQueries({ queryKey: projectKeys.detail(project.id) });
      }
    },
  });
}

export function useArchiveProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => projectService.archive(id),
    onSuccess: (project) => {
      void queryClient.invalidateQueries({ queryKey: projectKeys.all });
      toast.success(`${project.name} archived`);
    },
    onError: (error) => toast.error(toProjectErrorMessage(error)),
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();
  const router = useRouter();
  return useMutation({
    mutationFn: ({ id, confirmation }: { id: string; confirmation: string }) =>
      projectService.delete(id, confirmation),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: projectKeys.all });
      toast.success("Project deleted");
      router.push(routes.app.projects);
    },
    onError: (error) => toast.error(toProjectErrorMessage(error)),
  });
}

export function useDuplicateProject() {
  const queryClient = useQueryClient();
  const router = useRouter();
  return useMutation({
    mutationFn: ({ id, name, key }: { id: string; name: string; key: string }) =>
      projectService.duplicate(id, name, key),
    onSuccess: (project) => {
      void queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
      toast.success("Project duplicated");
      router.push(routes.app.project(project.id));
    },
    onError: (error) => toast.error(toProjectErrorMessage(error)),
  });
}

export function useTransferProjectOwnership(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ memberId, confirmation }: { memberId: string; confirmation: string }) =>
      projectService.transferOwnership(id, memberId, confirmation),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: projectKeys.detail(id) });
      void queryClient.invalidateQueries({ queryKey: projectKeys.members(id) });
      toast.success("Ownership transferred");
    },
    onError: (error) => toast.error(toProjectErrorMessage(error)),
  });
}

export function useProjectMembers(projectId: string | undefined) {
  return useQuery({
    queryKey: projectKeys.members(projectId ?? "unknown"),
    queryFn: () => projectService.listMembers(projectId!),
    enabled: Boolean(projectId),
  });
}

export function useProjectActivity(
  projectId: string | undefined,
  params?: { activityType?: string; page?: number; size?: number }
) {
  return useQuery({
    queryKey: [...projectKeys.activity(projectId ?? "unknown"), params ?? {}],
    queryFn: () => projectService.listActivity(projectId!, params),
    enabled: Boolean(projectId),
  });
}

export function useRestoreProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => projectService.restore(id),
    onSuccess: (project) => {
      void queryClient.invalidateQueries({ queryKey: projectKeys.all });
      toast.success(`${project.name} restored`);
    },
    onError: (error) => toast.error(toProjectErrorMessage(error)),
  });
}

export function useUpdateProjectStatus(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (status: UpdateProjectPayload["status"]) =>
      projectService.updateStatus(id, status!),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: projectKeys.detail(id) });
      void queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
      toast.success("Status updated");
    },
    onError: (error) => toast.error(toProjectErrorMessage(error)),
  });
}

export function useUpdateProjectHealth(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (health: NonNullable<UpdateProjectPayload["health"]>) =>
      projectService.updateHealth(id, health),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: projectKeys.detail(id) });
      void queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
      toast.success("Health updated");
    },
    onError: (error) => toast.error(toProjectErrorMessage(error)),
  });
}

export function useAddProjectMember(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { userId: string; role: import("../types/project.types").ProjectMember["role"] }) =>
      projectService.addMember(projectId, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: projectKeys.members(projectId) });
      void queryClient.invalidateQueries({ queryKey: projectKeys.detail(projectId) });
      toast.success("Member added");
    },
    onError: (error) => toast.error(toProjectErrorMessage(error)),
  });
}

export function useRemoveProjectMember(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => projectService.removeMember(projectId, userId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: projectKeys.members(projectId) });
      void queryClient.invalidateQueries({ queryKey: projectKeys.detail(projectId) });
      toast.success("Member removed");
    },
    onError: (error) => toast.error(toProjectErrorMessage(error)),
  });
}
