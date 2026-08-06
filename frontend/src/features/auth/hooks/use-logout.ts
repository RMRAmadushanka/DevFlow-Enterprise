"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { routes } from "@/config/routes";
import { toast } from "@/components/feedback/toast";

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
      toast.success("Signed out");
      router.replace(routes.auth.login);
    },
  });

  return {
    logout: mutation.mutateAsync,
    isPending: mutation.isPending,
  };
}
