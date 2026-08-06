import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, expect, it, vi } from "vitest";

import { RoleManagement } from "../role-management";
import type { OrgRoleDefinition } from "../../types/member.types";

const roles: OrgRoleDefinition[] = [
  {
    id: "role_1",
    key: "admin",
    name: "Admin",
    description: "Full admin access",
    isSystem: true,
    permissions: ["organization.read", "member.invite"],
    userCount: 2,
  },
];

const emptyMatrix = { roles: [] as const, rows: [] as const };

vi.mock("../../hooks/use-organizations", () => ({
  useRoles: () => ({ data: roles, isLoading: false, isError: false }),
  useDuplicateRole: () => ({ mutateAsync: vi.fn() }),
  usePermissionMatrix: () => ({
    data: emptyMatrix,
    isLoading: false,
    isError: false,
  }),
  useSavePermissionMatrix: () => ({ mutateAsync: vi.fn(), isPending: false }),
}));

vi.mock("@/lib/permissions", async () => {
  const actual = await vi.importActual<typeof import("@/lib/permissions")>("@/lib/permissions");
  return {
    ...actual,
    PermissionGuard: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  };
});

describe("RoleManagement", () => {
  it("renders role cards", () => {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(
      <QueryClientProvider client={client}>
        <RoleManagement organizationId="org_demo" />
      </QueryClientProvider>
    );

    expect(screen.getByRole("heading", { name: "Admin", level: 3 })).toBeInTheDocument();
    expect(screen.getByText("Full admin access")).toBeInTheDocument();
    expect(screen.getByText(/2 users/i)).toBeInTheDocument();
  });
});
