import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useRepositoryStore } from "../../store/repository.store";
import { RepositoriesView } from "../repositories-view";
import { sampleRepository } from "./fixtures";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  usePathname: () => "/repositories",
}));

vi.mock("../../hooks/use-repositories", () => ({
  useRepositories: () => ({
    data: { items: [sampleRepository], total: 1 },
    isLoading: false,
    isError: false,
  }),
  useToggleRepositoryFavorite: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useDuplicateRepository: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useArchiveRepository: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useDeleteRepository: () => ({ mutateAsync: vi.fn(), isPending: false, error: null }),
  useCreateRepository: () => ({ mutateAsync: vi.fn(), isPending: false, error: null }),
  useConnectRepository: () => ({ mutateAsync: vi.fn(), isPending: false, error: null }),
  useTransferRepository: () => ({ mutateAsync: vi.fn(), isPending: false, error: null }),
}));

vi.mock("@/lib/permissions", async () => {
  const actual = await vi.importActual<typeof import("@/lib/permissions")>("@/lib/permissions");
  return {
    ...actual,
    PermissionGuard: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  };
});

describe("RepositoriesView", () => {
  beforeEach(() => {
    useRepositoryStore.getState().resetFilters();
  });

  it("renders repository list header and cards", () => {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(
      <QueryClientProvider client={client}>
        <RepositoriesView />
      </QueryClientProvider>
    );

    expect(screen.getByRole("heading", { name: "Repositories" })).toBeInTheDocument();
    expect(screen.getAllByText("api-gateway").length).toBeGreaterThan(0);
  });
});
