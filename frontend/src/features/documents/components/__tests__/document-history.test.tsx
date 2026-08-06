import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, expect, it, vi } from "vitest";

import { DocumentHistory } from "../document-history";
import { sampleVersions } from "./fixtures";

vi.mock("../../hooks/use-documents", () => ({
  useDocumentHistory: () => ({ data: sampleVersions, isLoading: false }),
  useRestoreVersion: () => ({ mutateAsync: vi.fn(), isPending: false }),
}));

vi.mock("@/lib/permissions", async () => {
  const actual = await vi.importActual<typeof import("@/lib/permissions")>("@/lib/permissions");
  return {
    ...actual,
    PermissionGuard: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  };
});

describe("DocumentHistory", () => {
  it("renders version entries with restore action", () => {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(
      <QueryClientProvider client={client}>
        <DocumentHistory documentId="doc_architecture" />
      </QueryClientProvider>
    );

    expect(screen.getByText(/version\s*4/i)).toBeInTheDocument();
    expect(screen.getByText(/by Ava Chen/i)).toBeInTheDocument();
    expect(screen.getByText(/Added knowledge domain section/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /restore/i })).toBeInTheDocument();
  });
});
