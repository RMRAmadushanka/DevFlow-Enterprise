import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, expect, it, vi } from "vitest";

import { ReleaseList } from "../release-list";
import { sampleReleases } from "./fixtures";

vi.mock("../../hooks/use-repositories", () => ({
  useReleases: () => ({ data: sampleReleases, isLoading: false, isError: false }),
}));

describe("ReleaseList", () => {
  it("renders release versions", () => {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(
      <QueryClientProvider client={client}>
        <ReleaseList repositoryId="repo_api_gateway" />
      </QueryClientProvider>
    );

    expect(screen.getByText(/Gateway 1\.4\.0/i)).toBeInTheDocument();
    expect(screen.getByText(/v1\.4\.0/i)).toBeInTheDocument();
  });
});
