import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { LoginForm } from "../login-form";
import { DEMO_CREDENTIALS } from "../../constants/auth.constants";

const replace = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace, push: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("@/lib/auth/keycloak", async () => {
  const actual = await vi.importActual<typeof import("@/lib/auth/keycloak")>("@/lib/auth/keycloak");
  return {
    ...actual,
    isOidcEnabled: () => false,
    isKeycloakEnabled: () => false,
  };
});

vi.mock("../../services/auth.service", () => ({
  authService: {
    login: vi.fn(),
    socialLogin: vi.fn(),
  },
}));

import { authService } from "../../services/auth.service";

function renderForm() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <LoginForm />
    </QueryClientProvider>
  );
}

describe("LoginForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders email, password, remember me, and submit", () => {
    renderForm();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password/i)).toBeInTheDocument();
    expect(screen.getByRole("checkbox", { name: /remember me/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument();
  });

  it("validates empty password on submit", async () => {
    renderForm();
    const user = userEvent.setup();
    await user.clear(screen.getByLabelText(/^password/i));
    await user.click(screen.getByRole("button", { name: /sign in/i }));
    expect(await screen.findByText(/password is required/i)).toBeInTheDocument();
    expect(authService.login).not.toHaveBeenCalled();
  });

  it("submits credentials and calls login service", async () => {
    vi.mocked(authService.login).mockResolvedValue({
      user: {
        id: "1",
        email: DEMO_CREDENTIALS.email,
        firstName: "Avery",
        lastName: "Chen",
        name: "Avery Chen",
        timezone: "UTC",
        role: "admin",
        emailVerified: true,
        twoFactorEnabled: false,
        language: "en",
        dateFormat: "MDY",
        createdAt: new Date().toISOString(),
      },
      organizationId: "org",
      permissions: [],
      sessionId: "sess",
    });

    renderForm();
    const user = userEvent.setup();
    await user.type(screen.getByLabelText(/^password/i), DEMO_CREDENTIALS.password);
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(authService.login).toHaveBeenCalledWith(
        expect.objectContaining({
          email: DEMO_CREDENTIALS.email,
          password: DEMO_CREDENTIALS.password,
        })
      );
    });
  });
});
