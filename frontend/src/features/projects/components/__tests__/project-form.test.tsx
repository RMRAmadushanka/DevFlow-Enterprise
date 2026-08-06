import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, expect, it, vi } from "vitest";

import { ProjectForm } from "../project-form";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));

vi.mock("@/features/organization", async () => {
  const actual = await vi.importActual<typeof import("@/features/organization")>(
    "@/features/organization"
  );
  return {
    ...actual,
    useCurrentOrganization: () => ({
      organizationId: "org_demo",
      organization: { id: "org_demo", name: "Acme" },
      isLoading: false,
    }),
  };
});

vi.mock("../../hooks/use-projects", () => ({
  useCreateProject: () => ({ mutateAsync: vi.fn(), isPending: false, error: null }),
  useUpdateProject: () => ({ mutateAsync: vi.fn(), isPending: false, error: null }),
}));

function renderForm() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      <ProjectForm mode="create" />
    </QueryClientProvider>
  );
}

describe("ProjectForm", () => {
  it("renders create fields", () => {
    renderForm();
    expect(screen.getByLabelText(/project name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/project key/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
  });

  it("requires a name before submit", async () => {
    renderForm();
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: /create project/i }));
    expect(await screen.findByText(/project name is required/i)).toBeInTheDocument();
  });
});
