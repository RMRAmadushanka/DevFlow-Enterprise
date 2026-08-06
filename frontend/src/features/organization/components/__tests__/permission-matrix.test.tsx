import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, expect, it, vi } from "vitest";

import { PermissionMatrix } from "../permission-matrix";
import type { PermissionMatrixState } from "../../types/member.types";

const matrix: PermissionMatrixState = {
  roles: [
    { key: "admin", name: "Admin" },
    { key: "developer", name: "Developer" },
    { key: "viewer", name: "Viewer" },
  ],
  rows: [
    {
      permission: "project.create",
      label: "Create projects",
      group: "Projects",
      roles: { admin: true, developer: true, viewer: false },
    },
    {
      permission: "member.invite",
      label: "Invite members",
      group: "Members",
      roles: { admin: true, developer: false, viewer: false },
    },
  ],
};

vi.mock("../../hooks/use-organizations", () => ({
  usePermissionMatrix: () => ({ data: matrix, isLoading: false, isError: false }),
  useSavePermissionMatrix: () => ({ mutateAsync: vi.fn(), isPending: false }),
}));

vi.mock("@/lib/permissions", async () => {
  const actual = await vi.importActual<typeof import("@/lib/permissions")>("@/lib/permissions");
  return {
    ...actual,
    PermissionGuard: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  };
});

describe("PermissionMatrix", () => {
  it("renders permission rows and role columns", () => {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(
      <QueryClientProvider client={client}>
        <PermissionMatrix organizationId="org_demo" />
      </QueryClientProvider>
    );

    expect(screen.getByText("Create projects")).toBeInTheDocument();
    expect(screen.getByText("Invite members")).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: /admin/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /save changes/i })).toBeInTheDocument();
  });
});
