import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, expect, it, vi } from "vitest";

import { RepositoryForm } from "../repository-form";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));

vi.mock("../../hooks/use-repositories", () => ({
  useCreateRepository: () => ({ mutateAsync: vi.fn(), isPending: false, error: null }),
  useConnectRepository: () => ({ mutateAsync: vi.fn(), isPending: false, error: null }),
  useUpdateRepository: () => ({ mutateAsync: vi.fn(), isPending: false, error: null }),
}));

describe("RepositoryForm", () => {
  it("renders create fields", () => {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(
      <QueryClientProvider client={client}>
        <RepositoryForm mode="create" />
      </QueryClientProvider>
    );

    expect(screen.getByRole("textbox", { name: /name/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /create repository/i })).toBeInTheDocument();
  });
});
