import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, expect, it, vi } from "vitest";

import { ChangePasswordForm } from "../change-password-form";
import { authService } from "../../services/auth.service";

vi.mock("../../services/auth.service", () => ({
  authService: {
    changePassword: vi.fn(),
  },
}));

function renderForm() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      <ChangePasswordForm />
    </QueryClientProvider>,
  );
}

describe("ChangePasswordForm", () => {
  it("renders current, new, and confirm password fields", () => {
    renderForm();
    expect(screen.getByLabelText(/current password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^new password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm new password/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /update password/i }),
    ).toBeInTheDocument();
  });

  it("shows validation when passwords do not match", async () => {
    renderForm();
    const user = userEvent.setup();
    await user.type(screen.getByLabelText(/current password/i), "Password123!");
    await user.type(screen.getByLabelText(/^new password/i), "Password456!");
    await user.type(screen.getByLabelText(/confirm new password/i), "Password789!");
    await user.click(screen.getByRole("button", { name: /update password/i }));
    expect(await screen.findByText(/passwords do not match/i)).toBeInTheDocument();
    expect(authService.changePassword).not.toHaveBeenCalled();
  });
});
