"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { routes } from "@/config/routes";
import { toast } from "@/components/feedback/toast";
import { isKeycloakEnabled } from "@/lib/auth/keycloak";

import { authKeys } from "../constants/auth.constants";
import { authService } from "../services/auth.service";
import type { RegisterPayload } from "../types/auth.types";
import { toAuthErrorMessage } from "../utils/errors";

export function useRegister() {
  const router = useRouter();
  const oidcEnabled = isKeycloakEnabled();

  const mutation = useMutation({
    mutationKey: [...authKeys.all, "register"],
    mutationFn: (payload: RegisterPayload) => authService.register(payload),
    onSuccess: (result) => {
      // Keycloak redirects away before this runs.
      if (oidcEnabled) return;
      toast.success("Account created — verify your email");
      router.push(
        `${routes.auth.verifyEmail}?email=${encodeURIComponent(result.email)}&status=pending`
      );
    },
  });

  return {
    register: mutation.mutateAsync,
    isPending: mutation.isPending,
    error: mutation.error,
    errorMessage: mutation.error ? toAuthErrorMessage(mutation.error) : null,
    oidcEnabled,
    reset: mutation.reset,
  };
}
