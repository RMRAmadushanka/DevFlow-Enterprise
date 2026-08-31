import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { KeycloakAuthRedirect } from "../keycloak-auth-redirect";

const beginLoginRedirect = vi.fn();
const beginRegisterRedirect = vi.fn();
const beginPasswordResetRedirect = vi.fn();
const replace = vi.fn();
let keycloakEnabled = true;
let authenticated = false;

vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams(),
  useRouter: () => ({ replace, push: vi.fn() }),
}));

vi.mock("@/lib/auth/keycloak", () => ({
  isKeycloakEnabled: () => keycloakEnabled,
  isAuthenticated: () => authenticated,
  ensureKeycloakReady: () => Promise.resolve(true),
  beginLoginRedirect: (...args: unknown[]) => beginLoginRedirect(...args),
  beginRegisterRedirect: (...args: unknown[]) => beginRegisterRedirect(...args),
  beginPasswordResetRedirect: (...args: unknown[]) => beginPasswordResetRedirect(...args),
}));

describe("KeycloakAuthRedirect", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    keycloakEnabled = true;
    authenticated = false;
    beginLoginRedirect.mockRejectedValue(new Error("Redirecting to identity provider"));
    beginRegisterRedirect.mockRejectedValue(new Error("Redirecting to registration"));
    beginPasswordResetRedirect.mockRejectedValue(new Error("Redirecting to password reset"));
  });

  it("starts Keycloak login and does not render password fields", async () => {
    render(<KeycloakAuthRedirect flow="login" />);
    expect(screen.queryByLabelText(/^password$/i)).not.toBeInTheDocument();
    expect(screen.getByRole("status")).toBeInTheDocument();
    await waitFor(() => {
      expect(beginLoginRedirect).toHaveBeenCalled();
    });
  });

  it("starts Keycloak registration", async () => {
    render(<KeycloakAuthRedirect flow="register" />);
    await waitFor(() => {
      expect(beginRegisterRedirect).toHaveBeenCalled();
    });
    expect(beginLoginRedirect).not.toHaveBeenCalled();
  });

  it("sends an already-authenticated user into the app instead of Keycloak", async () => {
    authenticated = true;
    render(<KeycloakAuthRedirect flow="login" />);
    await waitFor(() => {
      expect(replace).toHaveBeenCalled();
    });
    expect(beginLoginRedirect).not.toHaveBeenCalled();
  });

  it("shows a configuration error when Keycloak is disabled", () => {
    keycloakEnabled = false;
    render(<KeycloakAuthRedirect flow="login" />);
    expect(screen.getByText(/identity provider is not configured/i)).toBeInTheDocument();
    expect(beginLoginRedirect).not.toHaveBeenCalled();
  });
});
