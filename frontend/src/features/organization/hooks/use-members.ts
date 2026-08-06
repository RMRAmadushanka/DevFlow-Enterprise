"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { toast } from "@/components/feedback/toast";

import { organizationKeys } from "../constants/organization.constants";
import { memberService } from "../services/member.service";
import type {
  ChangeMemberRolePayload,
  CreateTeamPayload,
  InviteMemberPayload,
  UpdateTeamPayload,
} from "../types/member.types";
import { toOrganizationErrorMessage } from "../utils/errors";

export function useMembers(orgId: string | undefined) {
  return useQuery({
    queryKey: organizationKeys.members(orgId ?? "unknown"),
    queryFn: () => memberService.listMembers(orgId!),
    enabled: Boolean(orgId),
  });
}

export function useChangeMemberRole(orgId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ChangeMemberRolePayload) => memberService.changeRole(orgId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: organizationKeys.members(orgId) });
      void queryClient.invalidateQueries({ queryKey: organizationKeys.roles(orgId) });
      toast.success("Member role updated");
    },
    onError: (error) => toast.error(toOrganizationErrorMessage(error)),
  });
}

export function useRemoveMember(orgId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (memberId: string) => memberService.removeMember(orgId, memberId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: organizationKeys.members(orgId) });
      void queryClient.invalidateQueries({ queryKey: organizationKeys.detail(orgId) });
      void queryClient.invalidateQueries({ queryKey: organizationKeys.lists() });
      toast.success("Member removed");
    },
    onError: (error) => toast.error(toOrganizationErrorMessage(error)),
  });
}

export function useInvitations(orgId: string | undefined) {
  return useQuery({
    queryKey: organizationKeys.invitations(orgId ?? "unknown"),
    queryFn: () => memberService.listInvitations(orgId!),
    enabled: Boolean(orgId),
  });
}

export function useInviteMember(orgId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: InviteMemberPayload) => memberService.invite(orgId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: organizationKeys.invitations(orgId) });
      void queryClient.invalidateQueries({ queryKey: organizationKeys.members(orgId) });
      void queryClient.invalidateQueries({ queryKey: organizationKeys.detail(orgId) });
      void queryClient.invalidateQueries({ queryKey: organizationKeys.lists() });
      toast.success("Invitation sent");
    },
    onError: (error) => toast.error(toOrganizationErrorMessage(error)),
  });
}

export function useResendInvitation(orgId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (invitationId: string) => memberService.resendInvitation(orgId, invitationId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: organizationKeys.invitations(orgId) });
      toast.success("Invitation resent");
    },
    onError: (error) => toast.error(toOrganizationErrorMessage(error)),
  });
}

export function useTeams(orgId: string | undefined) {
  return useQuery({
    queryKey: organizationKeys.teams(orgId ?? "unknown"),
    queryFn: () => memberService.listTeams(orgId!),
    enabled: Boolean(orgId),
  });
}

export function useCreateTeam(orgId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateTeamPayload) => memberService.createTeam(orgId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: organizationKeys.teams(orgId) });
      toast.success("Team created");
    },
    onError: (error) => toast.error(toOrganizationErrorMessage(error)),
  });
}

export function useUpdateTeam(orgId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ teamId, payload }: { teamId: string; payload: UpdateTeamPayload }) =>
      memberService.updateTeam(orgId, teamId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: organizationKeys.teams(orgId) });
      toast.success("Team updated");
    },
    onError: (error) => toast.error(toOrganizationErrorMessage(error)),
  });
}

export function useDeleteTeam(orgId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (teamId: string) => memberService.deleteTeam(orgId, teamId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: organizationKeys.teams(orgId) });
      toast.success("Team deleted");
    },
    onError: (error) => toast.error(toOrganizationErrorMessage(error)),
  });
}
