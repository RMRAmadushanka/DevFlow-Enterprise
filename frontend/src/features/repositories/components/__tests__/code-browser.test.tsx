import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, expect, it, vi } from "vitest";

import { CodeBrowser } from "../code-browser";
import { sampleFiles } from "./fixtures";

vi.mock("../../hooks/use-repositories", () => ({
  useRepositoryFiles: () => ({ data: sampleFiles, isLoading: false, isError: false }),
  useBranches: () => ({
    data: [{ id: "br_main", name: "main", isDefault: true, protected: true }],
    isLoading: false,
  }),
  useFileContent: () => ({
    data: {
      path: "README.md",
      name: "README.md",
      language: "Markdown",
      content: "# API Gateway",
      sizeBytes: 12,
      sha: "readme01",
    },
    isLoading: false,
  }),
}));

describe("CodeBrowser", () => {
  it("renders file explorer entries", () => {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(
      <QueryClientProvider client={client}>
        <CodeBrowser repositoryId="repo_api_gateway" />
      </QueryClientProvider>
    );

    expect(screen.getByLabelText(/file explorer/i)).toBeInTheDocument();
    expect(screen.getByText("README.md")).toBeInTheDocument();
    expect(screen.getByText("src")).toBeInTheDocument();
  });
});
