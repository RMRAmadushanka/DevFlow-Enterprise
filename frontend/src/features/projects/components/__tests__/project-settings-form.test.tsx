import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, expect, it, vi } from "vitest";

import { ProjectSettingsForm } from "../project-settings-form";
import { sampleProject } from "./fixtures";

vi.mock("../../hooks/use-projects", () => ({
  useUpdateProject: () => ({ mutateAsync: vi.fn(), isPending: false, error: null }),
}));

vi.mock("@/lib/permissions", async () => {
  const actual = await vi.importActual<typeof import("@/lib/permissions")>("@/lib/permissions");
  return {
    ...actual,
    PermissionGuard: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  };
});

describe("ProjectSettingsForm", () => {
  it("renders general settings and danger zone", () => {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(
      <QueryClientProvider client={client}>
        <ProjectSettingsForm project={sampleProject} />
      </QueryClientProvider>
    );

    expect(screen.getByText(/general settings/i)).toBeInTheDocument();
    expect(screen.getByText(/danger zone/i)).toBeInTheDocument();
    expect(screen.getByDisplayValue("API Gateway")).toBeInTheDocument();
  });
});
