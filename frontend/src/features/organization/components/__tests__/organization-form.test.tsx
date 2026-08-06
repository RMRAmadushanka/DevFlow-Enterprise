import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, expect, it, vi } from "vitest";

import { OrganizationForm } from "../organization-form";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));

vi.mock("../../services/organization.service", () => ({
  organizationService: {
    create: vi.fn(),
    list: vi.fn().mockResolvedValue([]),
  },
}));

function renderForm() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      <OrganizationForm mode="create" />
    </QueryClientProvider>
  );
}

describe("OrganizationForm", () => {
  it("renders create fields", () => {
    renderForm();
    expect(screen.getByLabelText(/organization name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^slug/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /create organization/i })).toBeInTheDocument();
  });

  it("requires a name before submit", async () => {
    renderForm();
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: /create organization/i }));
    expect(await screen.findByText(/name is required/i)).toBeInTheDocument();
  });
});
