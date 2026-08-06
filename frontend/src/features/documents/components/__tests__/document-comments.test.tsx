import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, expect, it, vi } from "vitest";

import { DocumentComments } from "../document-comments";
import { sampleComments } from "./fixtures";

vi.mock("../../hooks/use-documents", () => ({
  useDocumentComments: () => ({ data: sampleComments, isLoading: false }),
  useCreateDocumentComment: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useUpdateDocumentComment: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useDeleteDocumentComment: () => ({ mutateAsync: vi.fn(), isPending: false }),
}));

vi.mock("@/components/forms/rich-text", () => ({
  RichTextEditor: ({
    label,
    value,
    onValueChange,
  }: {
    label?: string;
    value?: string;
    onValueChange?: (v: string) => void;
  }) => (
    <label>
      {label}
      <textarea
        aria-label={label ?? "Comment"}
        value={value ?? ""}
        onChange={(e) => onValueChange?.(e.target.value)}
      />
    </label>
  ),
}));

vi.mock("@/lib/permissions", async () => {
  const actual = await vi.importActual<typeof import("@/lib/permissions")>("@/lib/permissions");
  return {
    ...actual,
    PermissionGuard: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  };
});

describe("DocumentComments", () => {
  it("renders comment threads", () => {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(
      <QueryClientProvider client={client}>
        <DocumentComments documentId="doc_architecture" />
      </QueryClientProvider>
    );

    expect(screen.getByText("Leo Martins")).toBeInTheDocument();
    expect(screen.getByText(/sequence diagram/i)).toBeInTheDocument();
  });
});
