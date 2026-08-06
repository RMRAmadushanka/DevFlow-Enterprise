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

export function useProjects() {
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
    onSuccess: (project) => {
      void queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: projectKeys.detail(project.id) });
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
      toast.success("Ownership transferred");
    },
    onError: (error) => toast.error(toProjectErrorMessage(error)),
  });
}
