"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import * as React from "react";

import { toast } from "@/components/feedback/toast";
import { routes } from "@/config/routes";

import { organizationKeys } from "../constants/organization.constants";
import { organizationService } from "../services/organization.service";
import { useOrganizationStore } from "../store/organization.store";
import type {
  CreateOrganizationPayload,
  TransferOwnershipPayload,
  UpdateBrandingPayload,
  UpdateOrganizationPayload,
} from "../types/organization.types";
import type { PermissionMatrixState } from "../types/member.types";
import { toOrganizationErrorMessage } from "../utils/errors";

export function useOrganizations(params?: { q?: string }) {
  const setOrganizations = useOrganizationStore((s) => s.setOrganizations);
  const query = useQuery({
    queryKey: organizationKeys.list(params),
    queryFn: () => organizationService.list(params),
  });

  React.useEffect(() => {
    if (query.data) setOrganizations(query.data);
  }, [query.data, setOrganizations]);

  return query;
}

export function useOrganization(id: string | undefined) {
  return useQuery({
    queryKey: organizationKeys.detail(id ?? "unknown"),
    queryFn: () => organizationService.getById(id!),
    enabled: Boolean(id),
  });
}

export function useOrganizationStats(id: string | undefined) {
  return useQuery({
    queryKey: organizationKeys.stats(id ?? "unknown"),
    queryFn: () => organizationService.getStats(id!),
    enabled: Boolean(id),
  });
}

export function useOrganizationActivity(id: string | undefined) {
  return useQuery({
    queryKey: organizationKeys.activity(id ?? "unknown"),
    queryFn: () => organizationService.getActivity(id!),
    enabled: Boolean(id),
  });
}

export function useAuditLogs(id: string | undefined) {
  return useQuery({
    queryKey: organizationKeys.audit(id ?? "unknown"),
    queryFn: () => organizationService.getAuditLogs(id!),
    enabled: Boolean(id),
  });
}

export function useCreateOrganization() {
  const queryClient = useQueryClient();
  const switchOrganization = useOrganizationStore((s) => s.switchOrganization);
  const router = useRouter();

  return useMutation({
    mutationFn: (payload: CreateOrganizationPayload) => organizationService.create(payload),
    onSuccess: (org) => {
      void queryClient.invalidateQueries({ queryKey: organizationKeys.lists() });
      switchOrganization(org.id);
      toast.success("Organization created");
      router.push(routes.app.organization(org.id));
    },
    onError: (error) => toast.error(toOrganizationErrorMessage(error)),
  });
}

export function useUpdateOrganization(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateOrganizationPayload) => organizationService.update(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: organizationKeys.detail(id) });
      void queryClient.invalidateQueries({ queryKey: organizationKeys.lists() });
      toast.success("Organization updated");
    },
    onError: (error) => toast.error(toOrganizationErrorMessage(error)),
  });
}

export function useUpdateBranding(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateBrandingPayload) => organizationService.updateBranding(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: organizationKeys.detail(id) });
      void queryClient.invalidateQueries({ queryKey: organizationKeys.lists() });
      toast.success("Branding saved");
    },
    onError: (error) => toast.error(toOrganizationErrorMessage(error)),
  });
}

export function useLeaveOrganization() {
  const queryClient = useQueryClient();
  const switchOrganization = useOrganizationStore((s) => s.switchOrganization);
  const organizations = useOrganizationStore((s) => s.organizations);
  const router = useRouter();

  return useMutation({
    mutationFn: (id: string) => organizationService.leave(id),
    onSuccess: (_void, id) => {
      void queryClient.invalidateQueries({ queryKey: organizationKeys.all });
      const next = organizations.find((org) => org.id !== id);
      if (next) switchOrganization(next.id);
      toast.success("Left organization");
      router.push(routes.app.organizations);
    },
    onError: (error) => toast.error(toOrganizationErrorMessage(error)),
  });
}

export function useTransferOwnership(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: TransferOwnershipPayload) =>
      organizationService.transferOwnership(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: organizationKeys.detail(id) });
      toast.success("Ownership transferred");
    },
    onError: (error) => toast.error(toOrganizationErrorMessage(error)),
  });
}

export function useDeleteOrganization() {
  const queryClient = useQueryClient();
  const router = useRouter();
  return useMutation({
    mutationFn: ({ id, confirmation }: { id: string; confirmation: string }) =>
      organizationService.delete(id, confirmation),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: organizationKeys.all });
      toast.success("Organization deleted");
      router.push(routes.app.organizations);
    },
    onError: (error) => toast.error(toOrganizationErrorMessage(error)),
  });
}

export function useRoles(orgId: string | undefined) {
  return useQuery({
    queryKey: organizationKeys.roles(orgId ?? "unknown"),
    queryFn: () => organizationService.listRoles(orgId!),
    enabled: Boolean(orgId),
  });
}

export function usePermissionMatrix(orgId: string | undefined) {
  return useQuery({
    queryKey: organizationKeys.matrix(orgId ?? "unknown"),
    queryFn: () => organizationService.getPermissionMatrix(orgId!),
    enabled: Boolean(orgId),
  });
}

export function useSavePermissionMatrix(orgId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (matrix: PermissionMatrixState) =>
      organizationService.savePermissionMatrix(orgId, matrix),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: organizationKeys.matrix(orgId) });
      toast.success("Permissions saved");
    },
    onError: (error) => toast.error(toOrganizationErrorMessage(error)),
  });
}

export function useDuplicateRole(orgId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (roleKey: string) => organizationService.duplicateRole(orgId, roleKey),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: organizationKeys.roles(orgId) });
      toast.success("Role duplicated");
    },
    onError: (error) => toast.error(toOrganizationErrorMessage(error)),
  });
}

export function useCurrentOrganization() {
  const currentOrganizationId = useOrganizationStore((s) => s.currentOrganizationId);
  const organizations = useOrganizationStore((s) => s.organizations);
  const fromList = organizations.find((org) => org.id === currentOrganizationId);
  const detail = useOrganization(currentOrganizationId ?? undefined);
  return {
    organizationId: currentOrganizationId,
    organization: detail.data ?? fromList ?? null,
    isLoading: detail.isLoading && !fromList,
  };
}
