import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, expect, it, vi } from "vitest";

import { SessionTable } from "../session-table";

vi.mock("../../services/auth.service", () => ({
  authService: {
    listSessions: vi.fn().mockResolvedValue([
      {
        id: "sess_current",
        device: "Windows PC",
        browser: "Chrome",
        location: "Bengaluru, IN",
        createdAt: new Date().toISOString(),
        lastActiveAt: new Date().toISOString(),
        current: true,
      },
      {
        id: "sess_other",
        device: "MacBook Pro",
        browser: "Safari",
        location: "SF",
        createdAt: new Date().toISOString(),
        lastActiveAt: new Date().toISOString(),
      },
    ]),
    revokeSession: vi.fn().mockResolvedValue(undefined),
  },
}));

import { authService } from "../../services/auth.service";

describe("SessionTable", () => {
  it("renders sessions and revokes a non-current session", async () => {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(
      <QueryClientProvider client={client}>
        <SessionTable />
      </QueryClientProvider>
    );

    expect(await screen.findByText("Windows PC")).toBeInTheDocument();
    expect(screen.getByText("MacBook Pro")).toBeInTheDocument();

    await userEvent.setup().click(screen.getByRole("button", { name: /log out/i }));
    await waitFor(() => {
      expect(authService.revokeSession).toHaveBeenCalledWith("sess_other");
    });
  });
});
