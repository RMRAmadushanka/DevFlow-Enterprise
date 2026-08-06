import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useDocumentStore } from "../../store/document.store";
import { DocumentsView } from "../documents-view";
import { sampleDocument } from "./fixtures";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  usePathname: () => "/documents",
}));

vi.mock("../../hooks/use-documents", () => ({
  useDocuments: () => ({
    data: {
      items: [sampleDocument],
      total: 1,
      folders: [],
      tree: [],
    },
    isLoading: false,
    isError: false,
  }),
  useToggleFavorite: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useArchiveDocument: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useDuplicateDocument: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useDocumentFavorites: () => ({ data: [sampleDocument], isLoading: false }),
  useDocumentTree: () => ({ data: [], isLoading: false }),
  useDocumentTemplates: () => ({ data: [], isLoading: false }),
  useCreateDocument: () => ({ mutateAsync: vi.fn(), isPending: false, error: null }),
  useShareDocument: () => ({ mutateAsync: vi.fn(), isPending: false, error: null }),
  useMoveDocument: () => ({ mutateAsync: vi.fn(), isPending: false, error: null }),
  useDeleteDocument: () => ({ mutateAsync: vi.fn(), isPending: false, error: null }),
}));

vi.mock("@/lib/permissions", async () => {
  const actual = await vi.importActual<typeof import("@/lib/permissions")>("@/lib/permissions");
  return {
    ...actual,
    PermissionGuard: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  };
});

describe("DocumentsView", () => {
  beforeEach(() => {
    useDocumentStore.getState().resetFilters();
  });

  it("renders knowledge base list with documents", () => {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(
      <QueryClientProvider client={client}>
        <DocumentsView title="Knowledge Base" />
      </QueryClientProvider>
    );

    expect(screen.getByRole("heading", { name: "Knowledge Base" })).toBeInTheDocument();
    expect(screen.getAllByText("Platform Architecture Overview").length).toBeGreaterThan(0);
  });
});
