import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, expect, it, vi } from "vitest";

import { RepositorySettings } from "../repository-settings";
import { sampleRepositoryDetail } from "./fixtures";

vi.mock("../../hooks/use-repositories", () => ({
  useUpdateRepository: () => ({ mutateAsync: vi.fn(), isPending: false, error: null }),
}));

describe("RepositorySettings", () => {
  it("renders editable repository settings", () => {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(
      <QueryClientProvider client={client}>
        <RepositorySettings repository={sampleRepositoryDetail} />
      </QueryClientProvider>
    );

    expect(screen.getByDisplayValue("api-gateway")).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: /name/i })).toBeInTheDocument();
    expect(screen.getByDisplayValue("main")).toBeInTheDocument();
  });
});
