"use client";

/**
 * Application-wide client providers.
 *
 * This file is infrastructure, not business logic: it wires up TanStack
 * Query so any future page/feature can fetch data with a consistent cache
 * policy. No queries, mutations, or API calls are defined here.
 */
import * as React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { queryConfig } from "@/config/query";

function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: queryConfig.staleTimeMs,
        gcTime: queryConfig.gcTimeMs,
        refetchOnWindowFocus: queryConfig.refetchOnWindowFocus,
        retry: queryConfig.retry,
      },
    },
  });
}

export function AppProviders({ children }: { children: React.ReactNode }) {
  const [queryClient] = React.useState(createQueryClient);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        {children}
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}
