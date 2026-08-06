import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, expect, it, vi } from "vitest";

import { useRepositoryStore } from "../../store/repository.store";
import { CommitList } from "../commit-list";
import { sampleCommits } from "./fixtures";

vi.mock("../../hooks/use-repositories", () => ({
  useCommits: () => ({ data: sampleCommits, isLoading: false, isError: false }),
  useBranches: () => ({
    data: [{ id: "br_main", name: "main", isDefault: true, protected: true }],
    isLoading: false,
  }),
  useCommit: () => ({ data: sampleCommits[0], isLoading: false }),
}));

describe("CommitList", () => {
  it("renders commit messages and short SHA", () => {
    useRepositoryStore.setState({ commitViewMode: "timeline" });
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(
      <QueryClientProvider client={client}>
        <CommitList repositoryId="repo_api_gateway" />
      </QueryClientProvider>
    );

    expect(screen.getByText(/tighten rate-limit burst windows/i)).toBeInTheDocument();
    expect(screen.getByText("a1b2c3d")).toBeInTheDocument();
  });
});
