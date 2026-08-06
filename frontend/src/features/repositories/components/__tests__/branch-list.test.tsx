import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, expect, it, vi } from "vitest";

import { BranchList } from "../branch-list";
import { sampleBranches } from "./fixtures";

vi.mock("../../hooks/use-repositories", () => ({
  useBranches: () => ({ data: sampleBranches, isLoading: false, isError: false }),
}));

describe("BranchList", () => {
  it("renders branches with default indicator", () => {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(
      <QueryClientProvider client={client}>
        <BranchList repositoryId="repo_api_gateway" />
      </QueryClientProvider>
    );

    expect(screen.getByText("main")).toBeInTheDocument();
    expect(screen.getByText("feat/rate-limit")).toBeInTheDocument();
    expect(screen.getByText(/default/i)).toBeInTheDocument();
  });
});
