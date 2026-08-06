import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, expect, it, vi } from "vitest";

import { ProfileForm } from "../profile-form";
import type { AuthUserProfile } from "../../types/auth.types";

vi.mock("../../services/auth.service", () => ({
  authService: {
    updateProfile: vi.fn(),
  },
}));

const user: AuthUserProfile = {
  id: "1",
  email: "demo@devflow.app",
  firstName: "Avery",
  lastName: "Chen",
  name: "Avery Chen",
  timezone: "UTC",
  role: "admin",
  emailVerified: true,
  twoFactorEnabled: false,
  language: "en",
  dateFormat: "MDY",
  createdAt: "2025-01-01T00:00:00.000Z",
};

describe("ProfileForm", () => {
  it("renders profile fields with existing values", () => {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(
      <QueryClientProvider client={client}>
        <ProfileForm user={user} />
      </QueryClientProvider>
    );

    expect(screen.getByDisplayValue("Avery")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Chen")).toBeInTheDocument();
    expect(screen.getByDisplayValue("demo@devflow.app")).toBeDisabled();
    expect(screen.getByRole("button", { name: /save profile/i })).toBeInTheDocument();
  });
});
