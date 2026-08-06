"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { toast } from "@/components/feedback/toast";

import { authKeys } from "../constants/auth.constants";
import { authService } from "../services/auth.service";
import { useAuthStore } from "../store/auth.store";
import type {
  ChangePasswordPayload,
  NotificationPreferences,
  UpdatePreferencesPayload,
  UpdateProfilePayload,
} from "../types/auth.types";
import { toAuthErrorMessage } from "../utils/errors";

export function useUpdateProfile() {
  const updateProfile = useAuthStore((s) => s.updateProfile);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateProfilePayload) => authService.updateProfile(payload),
    onSuccess: (user) => {
      updateProfile(user);
      void queryClient.invalidateQueries({ queryKey: authKeys.session() });
      toast.success("Profile updated");
    },
  });
}

export function useUpdatePreferences() {
  const updateProfile = useAuthStore((s) => s.updateProfile);
  return useMutation({
    mutationFn: (payload: UpdatePreferencesPayload) => authService.updatePreferences(payload),
    onSuccess: (user) => {
      updateProfile(user);
      toast.success("Preferences saved");
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (payload: ChangePasswordPayload) => authService.changePassword(payload),
    onSuccess: () => toast.success("Password changed"),
  });
}

export function useSessions() {
  return useQuery({
    queryKey: authKeys.sessions(),
    queryFn: () => authService.listSessions(),
  });
}

export function useRevokeSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (sessionId: string) => authService.revokeSession(sessionId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: authKeys.sessions() });
      toast.success("Session revoked");
    },
  });
}

export function useLoginHistory() {
  return useQuery({
    queryKey: authKeys.loginHistory(),
    queryFn: () => authService.listLoginHistory(),
  });
}

export function useTwoFactor() {
  const updateProfile = useAuthStore((s) => s.updateProfile);
  return useMutation({
    mutationFn: (enabled: boolean) => authService.setTwoFactorEnabled(enabled),
    onSuccess: (user) => {
      updateProfile(user);
      toast.success(user.twoFactorEnabled ? "2FA enabled" : "2FA disabled");
    },
  });
}

export function useApiKeys() {
  return useQuery({
    queryKey: authKeys.apiKeys(),
    queryFn: () => authService.listApiKeys(),
  });
}

export function useCreateApiKey() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => authService.createApiKey(name),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: authKeys.apiKeys() });
    },
  });
}

export function useRevokeApiKey() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => authService.revokeApiKey(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: authKeys.apiKeys() });
      toast.success("API key revoked");
    },
  });
}

export function useNotificationPreferences() {
  return useQuery({
    queryKey: authKeys.notifications(),
    queryFn: () => authService.getNotificationPreferences(),
  });
}

export function useUpdateNotificationPreferences() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: NotificationPreferences) =>
      authService.updateNotificationPreferences(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: authKeys.notifications() });
      toast.success("Notification preferences saved");
    },
    onError: (error) => toast.error(toAuthErrorMessage(error)),
  });
}
