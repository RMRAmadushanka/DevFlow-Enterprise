"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import * as React from "react";

import { toast } from "@/components/feedback/toast";
import { routes } from "@/config/routes";

import { documentKeys } from "../constants/document.constants";
import { commentService } from "../services/comment.service";
import { documentService } from "../services/document.service";
import { templateService } from "../services/template.service";
import { useDocumentStore } from "../store/document.store";
import type {
  CreateDocumentCommentPayload,
  CreateDocumentPayload,
  DocumentTemplateCategory,
  MoveDocumentPayload,
  ShareDocumentPayload,
  UpdateDocumentCommentPayload,
  UpdateDocumentPayload,
} from "../types/document.types";
import { toDocumentErrorMessage } from "../utils/errors";

export function useDocuments(overrides?: { trashOnly?: boolean; favoritesOnly?: boolean; sharedOnly?: boolean }) {
  const filters = useDocumentStore((s) => s.filters);
  const sort = useDocumentStore((s) => s.sort);
  const effectiveFilters = React.useMemo(
    () => ({
      ...filters,
      trashOnly: overrides?.trashOnly ?? filters.trashOnly,
      favoritesOnly: overrides?.favoritesOnly ?? filters.favoritesOnly,
      sharedOnly: overrides?.sharedOnly ?? filters.sharedOnly,
    }),
    [filters, overrides?.trashOnly, overrides?.favoritesOnly, overrides?.sharedOnly]
  );

  return useQuery({
    queryKey: documentKeys.list({ filters: effectiveFilters, sort }),
    queryFn: () => documentService.list({ filters: effectiveFilters, sort }),
  });
}

export function useDocument(id: string | undefined) {
  return useQuery({
    queryKey: documentKeys.detail(id ?? "unknown"),
    queryFn: () => documentService.getById(id!),
    enabled: Boolean(id),
  });
}

export function useCreateDocument() {
  const queryClient = useQueryClient();
  const router = useRouter();
  return useMutation({
    mutationFn: (payload: CreateDocumentPayload) => documentService.create(payload),
    onSuccess: (doc) => {
      void queryClient.invalidateQueries({ queryKey: documentKeys.all });
      toast.success("Document created");
      router.push(routes.app.document(doc.id));
    },
    onError: (error) => toast.error(toDocumentErrorMessage(error)),
  });
}

export function useUpdateDocument(id: string) {
  const queryClient = useQueryClient();
  const setAutoSaveStatus = useDocumentStore((s) => s.setAutoSaveStatus);
  return useMutation({
    mutationFn: (payload: UpdateDocumentPayload) => documentService.update(id, payload),
    onMutate: () => setAutoSaveStatus("saving"),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: documentKeys.detail(id) });
      void queryClient.invalidateQueries({ queryKey: documentKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: documentKeys.history(id) });
      setAutoSaveStatus("saved");
      toast.success("Document updated");
    },
    onError: (error) => {
      setAutoSaveStatus("error");
      toast.error(toDocumentErrorMessage(error));
    },
  });
}

export function useDeleteDocument() {
  const queryClient = useQueryClient();
  const router = useRouter();
  return useMutation({
    mutationFn: (id: string) => documentService.delete(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: documentKeys.all });
      toast.success("Document moved to trash");
      router.push(routes.app.documents);
    },
    onError: (error) => toast.error(toDocumentErrorMessage(error)),
  });
}

export function useDuplicateDocument() {
  const queryClient = useQueryClient();
  const router = useRouter();
  return useMutation({
    mutationFn: (id: string) => documentService.duplicate(id),
    onSuccess: (doc) => {
      void queryClient.invalidateQueries({ queryKey: documentKeys.all });
      toast.success("Document duplicated");
      router.push(routes.app.document(doc.id));
    },
    onError: (error) => toast.error(toDocumentErrorMessage(error)),
  });
}

export function useArchiveDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => documentService.archive(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: documentKeys.all });
      toast.success("Document archived");
    },
    onError: (error) => toast.error(toDocumentErrorMessage(error)),
  });
}

export function useToggleFavorite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => documentService.toggleFavorite(id),
    onSuccess: (doc) => {
      void queryClient.invalidateQueries({ queryKey: documentKeys.all });
      toast.success(doc.favorited ? "Added to favorites" : "Removed from favorites");
    },
    onError: (error) => toast.error(toDocumentErrorMessage(error)),
  });
}

export function useShareDocument(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ShareDocumentPayload) => documentService.share(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: documentKeys.detail(id) });
      void queryClient.invalidateQueries({ queryKey: documentKeys.shared() });
      toast.success("Sharing updated");
    },
    onError: (error) => toast.error(toDocumentErrorMessage(error)),
  });
}

export function useMoveDocument(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: MoveDocumentPayload) => documentService.move(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: documentKeys.all });
      toast.success("Document moved");
    },
    onError: (error) => toast.error(toDocumentErrorMessage(error)),
  });
}

export function useDocumentHistory(id: string | undefined) {
  return useQuery({
    queryKey: documentKeys.history(id ?? "unknown"),
    queryFn: () => documentService.history(id!),
    enabled: Boolean(id),
  });
}

export function useRestoreVersion(documentId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (versionId: string) => documentService.restoreVersion(documentId, versionId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: documentKeys.detail(documentId) });
      void queryClient.invalidateQueries({ queryKey: documentKeys.history(documentId) });
      toast.success("Version restored");
    },
    onError: (error) => toast.error(toDocumentErrorMessage(error)),
  });
}

export function useDocumentSearch(q: string) {
  return useQuery({
    queryKey: documentKeys.search(q),
    queryFn: () => documentService.search(q),
    enabled: q.trim().length >= 2,
  });
}

export function useDocumentFavorites() {
  return useQuery({
    queryKey: documentKeys.favorites(),
    queryFn: () => documentService.favorites(),
  });
}

export function useRecentDocuments() {
  return useQuery({
    queryKey: documentKeys.recent(),
    queryFn: () => documentService.recent(),
  });
}

export function useSharedDocuments() {
  return useQuery({
    queryKey: documentKeys.shared(),
    queryFn: () => documentService.shared(),
  });
}

export function useDocumentTree() {
  return useQuery({
    queryKey: documentKeys.tree(),
    queryFn: () => documentService.tree(),
  });
}

export function useDocumentTemplates(category?: DocumentTemplateCategory | "all" | null) {
  return useQuery({
    queryKey: documentKeys.templates(category),
    queryFn: () => templateService.list(category),
  });
}

export function useDocumentComments(documentId: string | undefined) {
  return useQuery({
    queryKey: documentKeys.comments(documentId ?? "unknown"),
    queryFn: () => commentService.list(documentId!),
    enabled: Boolean(documentId),
  });
}

export function useCreateDocumentComment(documentId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateDocumentCommentPayload) =>
      commentService.create(documentId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: documentKeys.comments(documentId) });
      toast.success("Comment added");
    },
    onError: (error) => toast.error(toDocumentErrorMessage(error)),
  });
}

export function useUpdateDocumentComment(documentId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateDocumentCommentPayload;
    }) => commentService.update(documentId, id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: documentKeys.comments(documentId) });
      toast.success("Comment updated");
    },
    onError: (error) => toast.error(toDocumentErrorMessage(error)),
  });
}

export function useDeleteDocumentComment(documentId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (commentId: string) => commentService.delete(documentId, commentId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: documentKeys.comments(documentId) });
      toast.success("Comment deleted");
    },
    onError: (error) => toast.error(toDocumentErrorMessage(error)),
  });
}

/** Convenience aliases matching the requested hook names. */
export const useDocumentsList = useDocuments;
export { useDocument as useDocumentDetail };
