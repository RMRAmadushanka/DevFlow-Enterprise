import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, expect, it, vi } from "vitest";

import { ShareDocumentModal } from "../share-document-modal";
import { sampleDocument } from "./fixtures";

vi.mock("../../hooks/use-documents", () => ({
  useShareDocument: () => ({ mutateAsync: vi.fn(), isPending: false, error: null }),
}));

describe("ShareDocumentModal", () => {
  it("renders sharing controls when open", () => {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(
      <QueryClientProvider client={client}>
        <ShareDocumentModal
          document={sampleDocument}
          open
          onOpenChange={vi.fn()}
        />
      </QueryClientProvider>
    );

    expect(screen.getByText(/share/i)).toBeInTheDocument();
    expect(screen.getByText(/visibility/i)).toBeInTheDocument();
  });
});
