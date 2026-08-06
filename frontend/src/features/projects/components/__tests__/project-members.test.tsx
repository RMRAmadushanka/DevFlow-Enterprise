import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ProjectMembers } from "../project-members";
import { sampleMembers } from "./fixtures";

vi.mock("@/lib/permissions", async () => {
  const actual = await vi.importActual<typeof import("@/lib/permissions")>("@/lib/permissions");
  return {
    ...actual,
    PermissionGuard: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  };
});

describe("ProjectMembers", () => {
  it("renders member list", () => {
    render(<ProjectMembers members={sampleMembers} />);
    expect(screen.getAllByText("Avery Chen").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Sam Rivera").length).toBeGreaterThan(0);
    expect(screen.getByRole("button", { name: /invite member/i })).toBeInTheDocument();
  });

  it("shows empty state when there are no members", () => {
    render(<ProjectMembers members={[]} />);
    expect(screen.getByText(/no members/i)).toBeInTheDocument();
  });
});
