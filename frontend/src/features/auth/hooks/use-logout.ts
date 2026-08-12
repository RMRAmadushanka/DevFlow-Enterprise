"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { routes } from "@/config/routes";
import { toast } from "@/components/feedback/toast";
import { isKeycloakEnabled } from "@/lib/auth/keycloak";

import { authKeys } from "../constants/auth.constants";
import { authService } from "../services/auth.service";
import { useAuthStore } from "../store/auth.store";

export function useLogout() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const logoutStore = useAuthStore((s) => s.logout);

  const mutation = useMutation({
    mutationKey: [...authKeys.all, "logout"],
    mutationFn: () => authService.logout(),
    onSuccess: async () => {
      logoutStore();
      await queryClient.removeQueries({ queryKey: authKeys.all });
      await queryClient.clear();
      toast.success("Signed out");

      // Keycloak logout redirects via the adapter; mock returns here.
      if (!isKeycloakEnabled()) {
        router.replace(routes.auth.login);
      }
    },
  });

  return {
    logout: mutation.mutateAsync,
    isPending: mutation.isPending,
  };
}
