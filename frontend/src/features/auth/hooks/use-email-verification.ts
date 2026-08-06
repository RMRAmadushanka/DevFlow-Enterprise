"use client";

import { useMutation, useQuery } from "@tanstack/react-query";

import { toast } from "@/components/feedback/toast";

import { authKeys } from "../constants/auth.constants";
import { authService } from "../services/auth.service";
import { useAuthStore } from "../store/auth.store";
import type { EmailVerificationStatus } from "../types/auth.types";
import { toAuthErrorMessage } from "../utils/errors";

export function useEmailVerification(token?: string | null, pendingEmail?: string | null) {
  const setSession = useAuthStore((s) => s.setSession);

  const verification = useQuery({
    queryKey: [...authKeys.all, "verify-email", token],
    queryFn: async (): Promise<EmailVerificationStatus> => {
      if (!token) return "invalid";
      const result = await authService.verifyEmail(token);
      if (result === "success") {
        const session = await authService.getSession();
        if (session) setSession(session);
      }
      return result;
    },
    enabled: Boolean(token),
    retry: false,
    staleTime: Infinity,
  });

  const resend = useMutation({
    mutationFn: (email: string) => authService.resendVerification(email),
    onSuccess: () => toast.success("Verification email sent"),
  });

  const status: EmailVerificationStatus = !token
    ? pendingEmail
      ? "checking"
      : "invalid"
    : verification.isLoading
      ? "checking"
      : (verification.data ?? "invalid");

  return {
    status: token ? status : pendingEmail ? ("checking" as const) : status,
    isPending: verification.isLoading,
    resend: resend.mutateAsync,
    resendPending: resend.isPending,
    resendError: resend.error ? toAuthErrorMessage(resend.error) : null,
  };
}
