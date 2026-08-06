import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { PermissionModal } from "../permission-modal";
import { sampleDocumentDetail } from "./fixtures";

describe("PermissionModal", () => {
  it("lists current access roles", () => {
    render(
      <PermissionModal
        document={sampleDocumentDetail}
        open
        onOpenChange={vi.fn()}
      />
    );

    expect(screen.getByText("Ava Chen")).toBeInTheDocument();
    expect(screen.getByText(/owner/i)).toBeInTheDocument();
    expect(screen.getByText("Leo Martins")).toBeInTheDocument();
    expect(screen.getByText(/editor/i)).toBeInTheDocument();
  });
});
