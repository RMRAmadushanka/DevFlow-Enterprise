import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, expect, it, vi } from "vitest";

import { RegisterForm } from "../register-form";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));

vi.mock("../../services/auth.service", () => ({
  authService: {
    register: vi.fn(),
  },
}));

function renderForm() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <RegisterForm />
    </QueryClientProvider>
  );
}

describe("RegisterForm", () => {
  it("renders core fields and terms checkbox", () => {
    renderForm();
    expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
    expect(
      screen.getByRole("checkbox", { name: /accept the terms/i }),
    ).toBeInTheDocument();
  });

  it("shows validation when terms are not accepted", async () => {
    renderForm();
    const user = userEvent.setup();
    await user.type(screen.getByLabelText(/first name/i), "Ada");
    await user.type(screen.getByLabelText(/last name/i), "Lovelace");
    await user.type(screen.getByLabelText(/email/i), "ada@example.com");
    await user.type(screen.getByLabelText(/^password/i), "Password123!");
    await user.type(screen.getByLabelText(/confirm password/i), "Password123!");
    await user.click(screen.getByRole("button", { name: /create account/i }));
    expect(await screen.findByText(/must accept the terms/i)).toBeInTheDocument();
  });
});
