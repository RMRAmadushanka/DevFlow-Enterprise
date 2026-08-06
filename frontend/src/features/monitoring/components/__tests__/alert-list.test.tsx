import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { AlertList } from "../alert-list";
import { sampleAlert } from "./fixtures";

vi.mock("@/lib/permissions", async () => {
  const actual = await vi.importActual<typeof import("@/lib/permissions")>("@/lib/permissions");
  return {
    ...actual,
    PermissionGuard: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  };
});

describe("AlertList", () => {
  it("renders alert cards", () => {
    render(<AlertList alerts={[sampleAlert]} />);

    expect(screen.getByText(/API latency p95 elevated/i)).toBeInTheDocument();
    expect(screen.getByText(/High/i)).toBeInTheDocument();
  });
});
