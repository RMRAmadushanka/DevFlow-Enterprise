import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, expect, it, vi } from "vitest";

import { ForgotPasswordForm } from "../forgot-password-form";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));

vi.mock("../../services/auth.service", () => ({
  authService: {
    forgotPassword: vi.fn().mockResolvedValue({ sent: true }),
    resetPassword: vi.fn(),
  },
}));

import { authService } from "../../services/auth.service";

describe("ForgotPasswordForm", () => {
  it("shows success message after submit", async () => {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(
      <QueryClientProvider client={client}>
        <ForgotPasswordForm />
      </QueryClientProvider>
    );

    const user = userEvent.setup();
    await user.type(screen.getByLabelText(/email/i), "demo@devflow.app");
    await user.click(screen.getByRole("button", { name: /send reset link/i }));

    await waitFor(() => {
      expect(authService.forgotPassword).toHaveBeenCalled();
    });
    expect(
      await screen.findByText(/password reset link has been sent/i)
    ).toBeInTheDocument();
  });
});
