import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, expect, it, vi } from "vitest";

import { PullRequestList } from "../pull-request-list";
import { samplePullRequests } from "./fixtures";

vi.mock("../../hooks/use-repositories", () => ({
  usePullRequests: () => ({ data: samplePullRequests, isLoading: false, isError: false }),
  usePullRequest: () => ({ data: samplePullRequests[0], isLoading: false }),
}));

describe("PullRequestList", () => {
  it("renders open pull requests", () => {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(
      <QueryClientProvider client={client}>
        <PullRequestList repositoryId="repo_api_gateway" />
      </QueryClientProvider>
    );

    expect(screen.getByText(/Add adaptive rate limiting/i)).toBeInTheDocument();
    expect(screen.getByText(/feat\/rate-limit/i)).toBeInTheDocument();
  });
});
