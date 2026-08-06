import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, expect, it, vi } from "vitest";

import { InviteMemberModal } from "../invite-member-modal";

vi.mock("../../hooks/use-members", () => ({
  useInviteMember: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
    error: null,
  }),
  useTeams: () => ({ data: [] }),
}));

describe("InviteMemberModal", () => {
  it("renders invite fields when open", () => {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(
      <QueryClientProvider client={client}>
        <InviteMemberModal organizationId="org_demo" open onOpenChange={vi.fn()} />
      </QueryClientProvider>
    );

    expect(screen.getByRole("heading", { name: /invite member/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /send invitation/i })).toBeInTheDocument();
  });

  it("validates email format", async () => {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(
      <QueryClientProvider client={client}>
        <InviteMemberModal organizationId="org_demo" open onOpenChange={vi.fn()} />
      </QueryClientProvider>
    );
    const user = userEvent.setup();
    await user.type(screen.getByLabelText(/email/i), "not-an-email");
    await user.click(screen.getByRole("button", { name: /send invitation/i }));
    expect(await screen.findByText(/enter a valid email/i)).toBeInTheDocument();
  });
});
