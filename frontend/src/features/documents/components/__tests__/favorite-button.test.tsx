import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, expect, it, vi } from "vitest";

import { FavoriteButton } from "../favorite-button";

vi.mock("../../hooks/use-documents", () => ({
  useToggleFavorite: () => ({ mutateAsync: vi.fn(), isPending: false }),
}));

vi.mock("@/lib/permissions", async () => {
  const actual = await vi.importActual<typeof import("@/lib/permissions")>("@/lib/permissions");
  return {
    ...actual,
    PermissionGuard: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  };
});

describe("FavoriteButton", () => {
  it("shows add and remove labels based on state", () => {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const { rerender } = render(
      <QueryClientProvider client={client}>
        <FavoriteButton documentId="doc_architecture" favorited={false} />
      </QueryClientProvider>
    );

    expect(screen.getByRole("button", { name: "Add to favorites" })).toBeInTheDocument();

    rerender(
      <QueryClientProvider client={client}>
        <FavoriteButton documentId="doc_architecture" favorited />
      </QueryClientProvider>
    );

    expect(screen.getByRole("button", { name: "Remove from favorites" })).toBeInTheDocument();
  });
});
