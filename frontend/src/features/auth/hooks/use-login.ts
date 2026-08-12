"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";

import { routes } from "@/config/routes";
import { toast } from "@/components/feedback/toast";
import { isOidcEnabled } from "@/lib/auth/keycloak";
import { safeInternalPath } from "@/lib/navigation/safe-internal-path";

import { authKeys } from "../constants/auth.constants";
import { authService } from "../services/auth.service";
import { useAuthStore } from "../store/auth.store";
import type { LoginPayload, SocialProvider } from "../types/auth.types";
import { toAuthErrorMessage } from "../utils/errors";

export function useLogin() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setSession = useAuthStore((s) => s.setSession);
  const nextPath = safeInternalPath(searchParams.get("next"), routes.app.dashboard);

  const login = useMutation({
    mutationKey: [...authKeys.all, "login"],
    mutationFn: (payload: LoginPayload) => authService.login(payload),
    onSuccess: (session) => {
      // OIDC redirects away before this runs; mock path continues here.
      setSession(session);
      toast.success("Welcome back");
      router.replace(nextPath);
    },
  });

  const social = useMutation({
    mutationKey: [...authKeys.all, "social-login"],
    mutationFn: (provider: SocialProvider) => authService.socialLogin(provider),
    onSuccess: (session) => {
      setSession(session);
      toast.success("Signed in");
      router.replace(nextPath);
    },
  });

  return {
    login: login.mutateAsync,
    socialLogin: social.mutateAsync,
    isPending: login.isPending || social.isPending,
    error: login.error || social.error,
    errorMessage: login.error || social.error ? toAuthErrorMessage(login.error || social.error) : null,
    oidcEnabled: isOidcEnabled(),
    reset: () => {
      login.reset();
      social.reset();
    },
  };
}
