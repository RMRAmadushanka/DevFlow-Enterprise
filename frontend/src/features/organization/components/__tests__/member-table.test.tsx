import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, expect, it, vi } from "vitest";

import { MemberTable } from "../member-table";
import type { OrganizationMember } from "../../types/member.types";

const members: OrganizationMember[] = [
  {
    id: "mem_1",
    organizationId: "org_demo",
    userId: "1",
    name: "Avery Chen",
    email: "demo@devflow.app",
    role: "admin",
    status: "active",
    teamIds: [],
    joinedAt: "2024-03-12T10:05:00.000Z",
  },
];

vi.mock("../../hooks/use-members", () => ({
  useMembers: () => ({ data: members, isLoading: false, isError: false }),
  useInvitations: () => ({ data: [] }),
  useChangeMemberRole: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useRemoveMember: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useResendInvitation: () => ({ mutateAsync: vi.fn(), isPending: false }),
}));

vi.mock("@/lib/permissions", async () => {
  const actual = await vi.importActual<typeof import("@/lib/permissions")>("@/lib/permissions");
  return {
    ...actual,
    PermissionGuard: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    usePermissionContext: () => ({
      role: "admin",
      permissions: actual.PERMISSIONS,
      can: () => true,
      canAny: () => true,
      canAll: () => true,
    }),
  };
});

describe("MemberTable", () => {
  it("renders member rows", () => {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(
      <QueryClientProvider client={client}>
        <MemberTable organizationId="org_demo" />
      </QueryClientProvider>
    );

    expect(screen.getAllByText("Avery Chen").length).toBeGreaterThan(0);
    expect(screen.getAllByText("demo@devflow.app").length).toBeGreaterThan(0);
  });
});
