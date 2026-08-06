"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import * as React from "react";

import { toast } from "@/components/feedback/toast";
import { routes } from "@/config/routes";

import { repositoryKeys } from "../constants/repository.constants";
import { branchService } from "../services/branch.service";
import { commitService } from "../services/commit.service";
import { releaseService } from "../services/release.service";
import { repositoryService } from "../services/repository.service";
import { useRepositoryStore } from "../store/repository.store";
import type {
  ConnectRepositoryPayload,
  CreateRepositoryPayload,
  CreateWebhookPayload,
  TransferRepositoryPayload,
  UpdateRepositoryPayload,
  UpdateWebhookPayload,
} from "../types/repository.types";
import { toRepositoryErrorMessage } from "../utils/errors";

export function useRepositories(projectId?: string | null) {
  const filters = useRepositoryStore((s) => s.filters);
  const sort = useRepositoryStore((s) => s.sort);
  const effectiveFilters = React.useMemo(
    () => ({
      ...filters,
      projectId: projectId ?? filters.projectId,
    }),
    [filters, projectId]
  );

  return useQuery({
    queryKey: repositoryKeys.list({ filters: effectiveFilters, sort }),
    queryFn: () => repositoryService.list({ filters: effectiveFilters, sort }),
  });
}

export function useRepository(id: string | undefined) {
  return useQuery({
    queryKey: repositoryKeys.detail(id ?? "unknown"),
    queryFn: () => repositoryService.getById(id!),
    enabled: Boolean(id),
  });
}

export function useCreateRepository() {
  const queryClient = useQueryClient();
  const router = useRouter();
  return useMutation({
    mutationFn: (payload: CreateRepositoryPayload) => repositoryService.create(payload),
    onSuccess: (repo) => {
      void queryClient.invalidateQueries({ queryKey: repositoryKeys.all });
      toast.success("Repository created");
      router.push(routes.app.repository(repo.id));
    },
    onError: (error) => toast.error(toRepositoryErrorMessage(error)),
  });
}

export function useConnectRepository() {
  const queryClient = useQueryClient();
  const router = useRouter();
  return useMutation({
    mutationFn: (payload: ConnectRepositoryPayload) => repositoryService.connect(payload),
    onSuccess: (repo) => {
      void queryClient.invalidateQueries({ queryKey: repositoryKeys.all });
      toast.success("Repository connected");
      router.push(routes.app.repository(repo.id));
    },
    onError: (error) => toast.error(toRepositoryErrorMessage(error)),
  });
}

export function useUpdateRepository(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateRepositoryPayload) => repositoryService.update(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: repositoryKeys.detail(id) });
      void queryClient.invalidateQueries({ queryKey: repositoryKeys.lists() });
      toast.success("Repository updated");
    },
    onError: (error) => toast.error(toRepositoryErrorMessage(error)),
  });
}

export function useDeleteRepository() {
  const queryClient = useQueryClient();
  const router = useRouter();
  return useMutation({
    mutationFn: (id: string) => repositoryService.delete(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: repositoryKeys.all });
      toast.success("Repository deleted");
      router.push(routes.app.repositories);
    },
    onError: (error) => toast.error(toRepositoryErrorMessage(error)),
  });
}

export function useArchiveRepository() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => repositoryService.archive(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: repositoryKeys.all });
      toast.success("Repository archived");
    },
    onError: (error) => toast.error(toRepositoryErrorMessage(error)),
  });
}

export function useTransferRepository(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: TransferRepositoryPayload) =>
      repositoryService.transfer(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: repositoryKeys.all });
      toast.success("Repository transferred");
    },
    onError: (error) => toast.error(toRepositoryErrorMessage(error)),
  });
}

export function useToggleRepositoryFavorite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => repositoryService.toggleFavorite(id),
    onSuccess: (repo) => {
      void queryClient.invalidateQueries({ queryKey: repositoryKeys.all });
      toast.success(repo.favorited ? "Added to favorites" : "Removed from favorites");
    },
    onError: (error) => toast.error(toRepositoryErrorMessage(error)),
  });
}

export function useDuplicateRepository() {
  const queryClient = useQueryClient();
  const router = useRouter();
  return useMutation({
    mutationFn: (id: string) => repositoryService.duplicate(id),
    onSuccess: (repo) => {
      void queryClient.invalidateQueries({ queryKey: repositoryKeys.all });
      toast.success("Repository duplicated");
      router.push(routes.app.repository(repo.id));
    },
    onError: (error) => toast.error(toRepositoryErrorMessage(error)),
  });
}

export function useBranches(repositoryId: string | undefined, q = "") {
  return useQuery({
    queryKey: [...repositoryKeys.branches(repositoryId ?? "unknown"), q] as const,
    queryFn: () => branchService.list(repositoryId!, q),
    enabled: Boolean(repositoryId),
  });
}

export function useCommits(repositoryId: string | undefined, branch?: string | null) {
  const selectedBranch = useRepositoryStore((s) => s.selectedBranch);
  const effectiveBranch = branch ?? selectedBranch;
  return useQuery({
    queryKey: repositoryKeys.commits(repositoryId ?? "unknown", effectiveBranch),
    queryFn: () => commitService.list(repositoryId!, effectiveBranch),
    enabled: Boolean(repositoryId),
  });
}

export function useCommit(repositoryId: string | undefined, commitId: string | undefined) {
  return useQuery({
    queryKey: [...repositoryKeys.detail(repositoryId ?? "unknown"), "commit", commitId] as const,
    queryFn: () => commitService.getById(repositoryId!, commitId!),
    enabled: Boolean(repositoryId && commitId),
  });
}

export function useTags(repositoryId: string | undefined) {
  return useQuery({
    queryKey: repositoryKeys.tags(repositoryId ?? "unknown"),
    queryFn: () => releaseService.listTags(repositoryId!),
    enabled: Boolean(repositoryId),
  });
}

export function useReleases(repositoryId: string | undefined) {
  return useQuery({
    queryKey: repositoryKeys.releases(repositoryId ?? "unknown"),
    queryFn: () => releaseService.list(repositoryId!),
    enabled: Boolean(repositoryId),
  });
}

export function usePullRequests(repositoryId: string | undefined) {
  return useQuery({
    queryKey: repositoryKeys.pullRequests(repositoryId ?? "unknown"),
    queryFn: () => repositoryService.listPullRequests(repositoryId!),
    enabled: Boolean(repositoryId),
  });
}

export function usePullRequest(
  repositoryId: string | undefined,
  pullRequestId: string | undefined
) {
  return useQuery({
    queryKey: [
      ...repositoryKeys.pullRequests(repositoryId ?? "unknown"),
      pullRequestId,
    ] as const,
    queryFn: () => repositoryService.getPullRequest(repositoryId!, pullRequestId!),
    enabled: Boolean(repositoryId && pullRequestId),
  });
}

export function useRepositoryFiles(repositoryId: string | undefined) {
  return useQuery({
    queryKey: repositoryKeys.files(repositoryId ?? "unknown"),
    queryFn: () => repositoryService.listFiles(repositoryId!),
    enabled: Boolean(repositoryId),
  });
}

export function useFileContent(repositoryId: string | undefined, path: string | undefined) {
  return useQuery({
    queryKey: repositoryKeys.fileContent(repositoryId ?? "unknown", path ?? ""),
    queryFn: () => repositoryService.getFile(repositoryId!, path!),
    enabled: Boolean(repositoryId && path),
  });
}

export function useRepositoryWebhooks(repositoryId: string | undefined) {
  return useQuery({
    queryKey: repositoryKeys.webhooks(repositoryId ?? "unknown"),
    queryFn: () => repositoryService.listWebhooks(repositoryId!),
    enabled: Boolean(repositoryId),
  });
}

export function useCreateWebhook(repositoryId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateWebhookPayload) =>
      repositoryService.createWebhook(repositoryId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: repositoryKeys.webhooks(repositoryId) });
      toast.success("Webhook created");
    },
    onError: (error) => toast.error(toRepositoryErrorMessage(error)),
  });
}

export function useUpdateWebhook(repositoryId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      webhookId,
      payload,
    }: {
      webhookId: string;
      payload: UpdateWebhookPayload;
    }) => repositoryService.updateWebhook(repositoryId, webhookId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: repositoryKeys.webhooks(repositoryId) });
      toast.success("Webhook updated");
    },
    onError: (error) => toast.error(toRepositoryErrorMessage(error)),
  });
}

export function useDeleteWebhook(repositoryId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (webhookId: string) =>
      repositoryService.deleteWebhook(repositoryId, webhookId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: repositoryKeys.webhooks(repositoryId) });
      toast.success("Webhook deleted");
    },
    onError: (error) => toast.error(toRepositoryErrorMessage(error)),
  });
}
