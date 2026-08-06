import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { describe, expect, it, vi } from "vitest";

import { ExportButton } from "./export-button";

describe("ExportButton", () => {
  it("invokes onExport with the chosen format", async () => {
    const onExport = vi.fn();
    render(<ExportButton onExport={onExport} />);

    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Export" }));
    await user.click(await screen.findByRole("menuitem", { name: /CSV/i }));
    expect(onExport).toHaveBeenCalledWith("csv");
  });

  it("shows loading label", () => {
    render(<ExportButton onExport={vi.fn()} status="loading" />);
    expect(screen.getByRole("button", { name: "Export" })).toBeDisabled();
    expect(screen.getByText("Exporting…")).toBeInTheDocument();
  });

  it("has no detectable accessibility violations", async () => {
    const { container } = render(<ExportButton onExport={vi.fn()} />);
    expect(await axe(container)).toHaveNoViolations();
  }, 15000);
});
