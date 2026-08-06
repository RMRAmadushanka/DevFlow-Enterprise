import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, expect, it, vi } from "vitest";

import { ProjectCard } from "../project-card";
import { sampleProject } from "./fixtures";

vi.mock("../../hooks/use-projects", () => ({
  useToggleFavorite: () => ({ mutateAsync: vi.fn(), isPending: false }),
}));

vi.mock("@/lib/permissions", async () => {
  const actual = await vi.importActual<typeof import("@/lib/permissions")>("@/lib/permissions");
  return {
    ...actual,
    PermissionGuard: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  };
});

describe("ProjectCard", () => {
  it("renders project name, status, and progress", () => {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(
      <QueryClientProvider client={client}>
        <ProjectCard project={sampleProject} />
      </QueryClientProvider>
    );

    expect(screen.getByText("API Gateway")).toBeInTheDocument();
    expect(screen.getByText("active")).toBeInTheDocument();
    expect(screen.getByText("78%")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /open project/i })).toHaveAttribute(
      "href",
      "/projects/proj_api"
    );
  });
});
