"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { routes } from "@/config/routes";
import { toast } from "@/components/feedback/toast";
import { isKeycloakEnabled } from "@/lib/auth/keycloak";

import { authKeys } from "../constants/auth.constants";
import { authService } from "../services/auth.service";
import type { ForgotPasswordPayload, ResetPasswordPayload } from "../types/auth.types";
import { toAuthErrorMessage } from "../utils/errors";

export function usePasswordReset() {
  const router = useRouter();
  const oidcEnabled = isKeycloakEnabled();

  const forgot = useMutation({
    mutationKey: [...authKeys.all, "forgot-password"],
    mutationFn: (payload: ForgotPasswordPayload) => authService.forgotPassword(payload),
  });

  const reset = useMutation({
    mutationKey: [...authKeys.all, "reset-password"],
    mutationFn: (payload: ResetPasswordPayload) => authService.resetPassword(payload),
    onSuccess: () => {
      if (oidcEnabled) return;
      toast.success("Password updated");
      router.replace(routes.auth.login);
    },
  });

  return {
    forgotPassword: forgot.mutateAsync,
    resetPassword: reset.mutateAsync,
    forgotPending: forgot.isPending,
    resetPending: reset.isPending,
    forgotSuccess: forgot.isSuccess && !oidcEnabled,
    oidcEnabled,
    forgotErrorMessage: forgot.error ? toAuthErrorMessage(forgot.error) : null,
    resetErrorMessage: reset.error ? toAuthErrorMessage(reset.error) : null,
    resetForgot: forgot.reset,
  };
}
