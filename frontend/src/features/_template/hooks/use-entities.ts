"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryOptions,
} from "@tanstack/react-query";

import { createQueryKeys } from "@/lib/api";
import type { PaginatedResult } from "@/types/common";
import { entityService } from "../services/entity.service";
import type {
  CreateEntityInput,
  Entity,
  EntityListParams,
  UpdateEntityInput,
} from "../types/entity.types";

/**
 * Query-key factory for this feature.
 * Invalidate with `queryClient.invalidateQueries({ queryKey: entityKeys.all })`.
 */
export const entityKeys = createQueryKeys("entities");

/** List query — pages call this; never call the service from components. */
export function useGetEntities(
  params: EntityListParams,
  options?: Omit<UseQueryOptions<PaginatedResult<Entity>>, "queryKey" | "queryFn">
) {
  return useQuery({
    queryKey: entityKeys.list(params),
    queryFn: () => entityService.list(params),
    ...options,
  });
}

export function useGetEntity(
  id: string,
  options?: Omit<UseQueryOptions<Entity>, "queryKey" | "queryFn">
) {
  return useQuery({
    queryKey: entityKeys.detail(id),
    queryFn: () => entityService.getById(id),
    enabled: Boolean(id),
    ...options,
  });
}

export function useCreateEntity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateEntityInput) => entityService.create(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: entityKeys.lists() });
    },
  });
}

export function useUpdateEntity(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateEntityInput) => entityService.update(id, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: entityKeys.detail(id) });
      void queryClient.invalidateQueries({ queryKey: entityKeys.lists() });
    },
  });
}

export function useDeleteEntity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => entityService.remove(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: entityKeys.all });
    },
  });
}
