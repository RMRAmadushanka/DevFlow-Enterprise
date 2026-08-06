import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, expect, it, vi } from "vitest";

import { RepositoryCard } from "../repository-card";
import { sampleRepository } from "./fixtures";

vi.mock("../../hooks/use-repositories", () => ({
  useToggleRepositoryFavorite: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useDuplicateRepository: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useArchiveRepository: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useDeleteRepository: () => ({ mutateAsync: vi.fn(), isPending: false }),
}));

vi.mock("@/lib/permissions", async () => {
  const actual = await vi.importActual<typeof import("@/lib/permissions")>("@/lib/permissions");
  return {
    ...actual,
    PermissionGuard: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  };
});

describe("RepositoryCard", () => {
  it("shows repository metadata", () => {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(
      <QueryClientProvider client={client}>
        <RepositoryCard repository={sampleRepository} />
      </QueryClientProvider>
    );

    expect(screen.getByText("api-gateway")).toBeInTheDocument();
    expect(screen.getByText(/acme/i)).toBeInTheDocument();
    expect(screen.getByText(/TypeScript/i)).toBeInTheDocument();
    expect(screen.getByText(/Healthy/i)).toBeInTheDocument();
  });
});
