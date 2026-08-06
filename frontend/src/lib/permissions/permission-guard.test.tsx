import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { PermissionGuard, PermissionProvider } from "./index";

describe("PermissionGuard", () => {
  it("renders children when permission is granted", () => {
    render(
      <PermissionProvider role="admin">
        <PermissionGuard permission="project.delete">
          <button type="button">Delete</button>
        </PermissionGuard>
      </PermissionProvider>
    );
    expect(screen.getByRole("button", { name: "Delete" })).toBeInTheDocument();
  });

  it("hides children when permission is denied", () => {
    render(
      <PermissionProvider role="viewer">
        <PermissionGuard permission="project.delete" fallback={<span>Denied</span>}>
          <button type="button">Delete</button>
        </PermissionGuard>
      </PermissionProvider>
    );
    expect(screen.queryByRole("button", { name: "Delete" })).not.toBeInTheDocument();
    expect(screen.getByText("Denied")).toBeInTheDocument();
  });
});
